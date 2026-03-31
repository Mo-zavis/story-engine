/**
 * Freepik API service — replaces OpenAI (DALL-E), ElevenLabs, and music placeholders
 * with a single unified API for image gen, image-to-video, music, and sound effects.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../../assets/outputs');

const API_KEY = process.env.FREEPIK_API_KEY || '';
const BASE = 'https://api.freepik.com/v1/ai';
const HEADERS = { 'x-freepik-api-key': API_KEY, 'Content-Type': 'application/json' };

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function apiPost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST', headers: { ...HEADERS, 'x-freepik-api-key': getKey() }, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Freepik ${endpoint} ${res.status}: ${txt}`);
  }
  return res.json() as Promise<{ data: { task_id: string; status: string; generated: string[] } }>;
}

async function pollTask(endpoint: string, taskId: string, maxWait = 300_000): Promise<string[]> {
  const start = Date.now();
  const pollUrl = `${BASE}${endpoint}/${taskId}`;
  while (Date.now() - start < maxWait) {
    await sleep(5000);
    const res = await fetch(pollUrl, { headers: { 'x-freepik-api-key': getKey() } });
    const json = await res.json() as { data: { status: string; generated: string[] } };
    if (json.data?.status === 'COMPLETED') return json.data.generated;
    if (json.data?.status === 'FAILED') throw new Error(`Freepik task ${taskId} failed`);
  }
  throw new Error(`Freepik task ${taskId} timed out`);
}

function getKey(): string {
  const k = process.env.FREEPIK_API_KEY;
  if (!k) throw new Error('FREEPIK_API_KEY not set in environment');
  return k;
}

async function downloadToAssets(url: string, subdir: string, ext: string): Promise<{ localPath: string; servePath: string }> {
  const dir = join(ASSETS_DIR, subdir);
  await mkdir(dir, { recursive: true });
  const filename = `${uuidv4().slice(0, 12)}.${ext}`;
  const localPath = join(dir, filename);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(localPath, buf);
  return { localPath, servePath: `/assets/outputs/${subdir}/${filename}` };
}

// ── Image Generation (Mystic Realism) ────────────────────────────────────────

const ASPECT_MAP: Record<string, string> = {
  '9:16': 'social_story_9_16',
  '16:9': 'widescreen_16_9',
  '1:1': 'square_1_1',
};

export async function generateImage(
  prompt: string,
  style: string,
  aspectRatio: '9:16' | '1:1' | '16:9'
): Promise<{ imageUrl: string; localPath: string; cdnUrl: string }> {
  const fullPrompt = `${prompt}. Style: ${style}`;

  const result = await apiPost('/mystic', {
    prompt: fullPrompt,
    resolution: '2k',
    aspect_ratio: ASPECT_MAP[aspectRatio] || 'social_story_9_16',
    styling: { model: 'realism' },
  });

  const generated = await pollTask('/mystic', result.data.task_id);
  const cdnUrl = generated[0];
  const { localPath, servePath } = await downloadToAssets(cdnUrl, 'frames', 'png');
  return { imageUrl: servePath, localPath, cdnUrl };
}

export async function generateCharacterRef(
  name: string,
  description: string,
  style: string
): Promise<{ imageUrl: string; localPath: string }> {
  const prompt = `Character reference portrait for "${name}": ${description}. Style: ${style}. Full body portrait on neutral background. High detail, front-facing, character design.`;

  const result = await apiPost('/mystic', {
    prompt,
    resolution: '2k',
    aspect_ratio: 'square_1_1',
    styling: { model: 'realism' },
  });

  const generated = await pollTask('/mystic', result.data.task_id);
  const { localPath, servePath } = await downloadToAssets(generated[0], 'characters', 'png');
  return { imageUrl: servePath, localPath };
}

// ── Image-to-Video (Kling O1 Standard) ───────────────────────────────────────

export async function imageToVideo(
  imageUrl: string,
  motionPrompt: string,
  durationSeconds: number,
  aspectRatio: string = '9:16',
  lastFrameUrl?: string  // CDN URL of next scene's keyframe for continuity
): Promise<{ videoUrl: string; localPath: string }> {
  const dur = String(Math.min(10, Math.max(5, durationSeconds === 10 ? 10 : 5)));
  const arMap: Record<string, string> = { '9:16': '9:16', '16:9': '16:9', '1:1': '1:1' };

  const body: Record<string, unknown> = {
    first_frame: imageUrl,
    prompt: motionPrompt,
    duration: dur,
    aspect_ratio: arMap[aspectRatio] || '9:16',
  };

  // Scene continuity: Kling interpolates between first and last frame
  if (lastFrameUrl) {
    body.last_frame = lastFrameUrl;
    console.log('  [freepik] Using last_frame for scene continuity');
  }

  const result = await apiPost('/image-to-video/kling-o1-std', body as Record<string, unknown>);

  // Remove the duplicate apiPost call below — it's now handled above
  const generated = await pollTask('/image-to-video/kling-o1', result.data.task_id, 600_000);
  const { localPath, servePath } = await downloadToAssets(generated[0], 'videos', 'mp4');
  return { videoUrl: servePath, localPath };
}

// ── Music Generation ─────────────────────────────────────────────────────────

const MUSIC_PROMPTS: Record<string, string> = {
  emotional: 'Emotional cinematic piano underscore, documentary film score, intimate solo piano building with subtle strings, minor key, Moonlight soundtrack feel',
  uplifting: 'Uplifting cinematic orchestral build, inspirational documentary underscore, starts with solo piano then adds hopeful strings and gentle percussion',
  tense: 'Tense suspenseful cinematic strings, documentary tension underscore, low cello drone with staccato violins building anxiety',
  epic: 'Epic cinematic orchestral crescendo, documentary finale score, full orchestra with heroic brass and timpani, triumphant resolution',
  peaceful: 'Peaceful ambient piano with soft pad, meditative documentary underscore, gentle and contemplative',
  mysterious: 'Mysterious atmospheric underscore, low synth drones with sparse piano notes, documentary mystery feel',
};

export async function generateMusic(
  mood: string,
  durationSeconds: number = 60
): Promise<{ audioUrl: string; localPath: string }> {
  const prompt = MUSIC_PROMPTS[mood] || MUSIC_PROMPTS.emotional;
  const dur = Math.min(240, Math.max(10, durationSeconds));

  const result = await apiPost('/music-generation', {
    prompt: `${prompt}. ${dur} seconds.`,
    music_length_seconds: dur,
  });

  const generated = await pollTask('/music-generation', result.data.task_id);
  const { localPath, servePath } = await downloadToAssets(generated[0], 'music', 'wav');
  return { audioUrl: servePath, localPath };
}

// ── Sound Effects ────────────────────────────────────────────────────────────

export async function generateSoundEffect(
  description: string,
  durationSeconds: number = 5
): Promise<{ audioUrl: string; localPath: string }> {
  const dur = Math.min(22, Math.max(0.5, durationSeconds));

  const result = await apiPost('/sound-effects', {
    text: description,
    duration_seconds: dur,
  });

  const generated = await pollTask('/sound-effects', result.data.task_id);
  const { localPath, servePath } = await downloadToAssets(generated[0], 'sfx', 'wav');
  return { audioUrl: servePath, localPath };
}
