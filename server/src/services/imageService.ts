/**
 * Image generation service.
 * Priority: Gemini Imagen 3 → Freepik Mystic → OpenAI DALL-E
 */

import { createWriteStream, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../../assets/outputs');
mkdirSync(ASSETS_DIR, { recursive: true });

// ── Gemini Imagen 3 ───────────────────────────────────────────────────────────

type GeminiAspect = '1:1' | '9:16' | '16:9' | '3:4' | '4:3';

function aspectToGemini(ratio: string): GeminiAspect {
  if (ratio === '9:16') return '9:16';
  if (ratio === '16:9') return '16:9';
  if (ratio === '3:4') return '3:4';
  if (ratio === '4:3') return '4:3';
  return '1:1';
}

async function generateWithGemini(
  prompt: string,
  aspectRatio: string,
  subdir: string
): Promise<{ imageUrl: string; localPath: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: aspectToGemini(aspectRatio),
      personGeneration: 'allow_adult',
    },
  });

  const raw = await new Promise<Buffer>((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            const txt = Buffer.concat(chunks).toString();
            reject(new Error(`Gemini Imagen ${res.statusCode}: ${txt}`));
          } else {
            resolve(Buffer.concat(chunks));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  const json = JSON.parse(raw.toString()) as {
    predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
  };

  const prediction = json.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    throw new Error(`Gemini Imagen returned no image: ${raw.toString().slice(0, 300)}`);
  }

  const imgBuffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
  const dir = join(ASSETS_DIR, subdir);
  mkdirSync(dir, { recursive: true });
  const filename = `${subdir.replace('/', '_')}_${uuidv4().slice(0, 8)}.png`;
  const localPath = join(dir, filename);
  writeFileSync(localPath, imgBuffer);

  return { imageUrl: `/assets/outputs/${subdir}/${filename}`, localPath };
}

// ── Freepik Mystic fallback ───────────────────────────────────────────────────

import * as freepik from './freepikService.js';

async function generateWithFreepik(
  prompt: string,
  aspectRatio: string,
  _subdir: string
): Promise<{ imageUrl: string; localPath: string }> {
  const fpAspect = (aspectRatio === '9:16' ? '9:16' : aspectRatio === '16:9' ? '16:9' : '1:1') as '1:1' | '9:16' | '16:9';
  return freepik.generateImage(prompt, '', fpAspect);
}

// ── OpenAI DALL-E fallback ────────────────────────────────────────────────────

import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

type DalleSize = '1024x1024' | '1024x1792' | '1792x1024';
function aspectToDALLE(ratio: string): DalleSize {
  if (ratio === '9:16') return '1024x1792';
  if (ratio === '16:9') return '1792x1024';
  return '1024x1024';
}

async function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', reject);
  });
}

async function generateWithDALLE(
  prompt: string,
  aspectRatio: string,
  subdir: string
): Promise<{ imageUrl: string; localPath: string }> {
  const response = await getOpenAI().images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: aspectToDALLE(aspectRatio),
    quality: 'hd',
  });

  const url = response.data![0].url!;
  const dir = join(ASSETS_DIR, subdir);
  mkdirSync(dir, { recursive: true });
  const filename = `${subdir.replace('/', '_')}_${uuidv4().slice(0, 8)}.png`;
  const localPath = join(dir, filename);
  await downloadImage(url, localPath);
  return { imageUrl: `/assets/outputs/${subdir}/${filename}`, localPath };
}

// ── Unified generator ─────────────────────────────────────────────────────────

async function generateImage(
  prompt: string,
  aspectRatio: string,
  subdir: string
): Promise<{ imageUrl: string; localPath: string }> {
  // Try Gemini Imagen 3 first (highest quality, free tier generous)
  if (process.env.GEMINI_API_KEY) {
    try {
      return await generateWithGemini(prompt, aspectRatio, subdir);
    } catch (err) {
      console.warn('[imageService] Gemini failed, trying Freepik:', (err as Error).message);
    }
  }

  // Freepik Mystic fallback
  if (process.env.FREEPIK_API_KEY) {
    try {
      return await generateWithFreepik(prompt, aspectRatio, subdir);
    } catch (err) {
      console.warn('[imageService] Freepik failed, trying DALL-E:', (err as Error).message);
    }
  }

  // DALL-E last resort
  return generateWithDALLE(prompt, aspectRatio, subdir);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateCharacterImage(
  characterName: string,
  description: string,
  style: string
): Promise<{ imageUrl: string; localPath: string }> {
  const prompt = `Character reference sheet for "${characterName}": ${description}.
Style: ${style}.
Full body portrait on neutral background.
High detail, character design reference, front-facing, professional illustration quality.
Square format, centered composition.
NEGATIVE: text, watermark, signature, blur, ugly, bad anatomy.`;

  return generateImage(prompt, '1:1', 'characters');
}

export async function generateSceneFrame(
  prompt: string,
  style: string,
  aspectRatio: '9:16' | '1:1' | '16:9'
): Promise<{ imageUrl: string; localPath: string }> {
  const fullPrompt = `${prompt}. Style: ${style}. ${aspectRatio === '9:16' ? 'Vertical composition for mobile video, 9:16 aspect ratio.' : ''} Cinematic quality, high detail, professional photography. NEGATIVE: text, watermark, blur, bad anatomy.`;
  return generateImage(fullPrompt, aspectRatio, 'frames');
}

export async function generateCoverImage(
  title: string,
  description: string
): Promise<{ imageUrl: string; localPath: string }> {
  const prompt = `Movie poster / Instagram thumbnail for: "${title}". ${description}. Cinematic, professional, compelling visual hook. Vertical 9:16 format. NEGATIVE: text overlay, watermark, blur.`;
  return generateImage(prompt, '9:16', 'covers');
}
