/**
 * Source Asset Service — handles real brand assets, footage clips, logos, app screenshots
 * that get composited into AI-generated frames or replace AI generation entirely.
 *
 * Scene types that use source assets:
 * - source_footage: Real video clip replaces AI-generated clip entirely
 * - screen_composite: Real screenshot overlaid on AI-generated phone screen
 * - brand_card: Logo/brand assets on a designed template
 * - overlay: Real asset layered on top of AI frame (watermark, lower third, etc.)
 */

import { existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../../assets/outputs');
const SOURCE_DIR = join(__dirname, '../../../assets/sources');
mkdirSync(SOURCE_DIR, { recursive: true });

export interface SourceAsset {
  id: string;
  type: 'video_clip' | 'screenshot' | 'logo' | 'font' | 'image' | 'audio';
  label: string;
  filePath: string;       // local path to the file
  servePath: string;      // URL path for serving
  duration?: number;      // for video/audio clips
  width?: number;
  height?: number;
  tags: string[];         // e.g. ['fsp_app', 'brand', 'scene_6']
  sceneAssignment?: string; // which scene ID this is assigned to
  compositeMode?: 'replace' | 'overlay_phone' | 'overlay_corner' | 'lower_third' | 'fullscreen';
  compositeParams?: {
    x?: number;           // overlay position
    y?: number;
    width?: number;       // overlay size
    height?: number;
    opacity?: number;
    startTime?: number;   // when overlay appears
    endTime?: number;     // when overlay disappears
  };
}

/**
 * Composite a source asset onto an AI-generated frame/video.
 * This is the actual FFmpeg operation that merges real content into the pipeline.
 */
export async function compositeAssetOntoVideo(
  baseVideoPath: string,
  asset: SourceAsset,
  outputPath?: string
): Promise<string> {
  if (!existsSync(baseVideoPath)) throw new Error(`Base video not found: ${baseVideoPath}`);
  if (!existsSync(asset.filePath)) throw new Error(`Source asset not found: ${asset.filePath}`);

  const out = outputPath || join(ASSETS_DIR, 'composited', `comp_${uuidv4().slice(0, 8)}.mp4`);
  mkdirSync(dirname(out), { recursive: true });

  const mode = asset.compositeMode || 'overlay_phone';

  switch (mode) {
    case 'replace':
      // Use the source asset directly instead of the AI video
      // Trim to match expected duration if needed
      await execAsync(
        `ffmpeg -y -i "${asset.filePath}" -c:v libx264 -r 30 -pix_fmt yuv420p ` +
        `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" ` +
        `-c:a aac -b:a 128k "${out}"`,
        { timeout: 60000 }
      );
      break;

    case 'overlay_phone':
      // Overlay a screenshot onto a phone screen area in the AI frame
      // Assumes the phone screen is roughly center of frame
      const px = asset.compositeParams?.x ?? 270;  // phone screen left edge in 1080px frame
      const py = asset.compositeParams?.y ?? 600;   // phone screen top edge in 1920px frame
      const pw = asset.compositeParams?.width ?? 540; // phone screen width
      const ph = asset.compositeParams?.height ?? 960; // phone screen height
      const opacity = asset.compositeParams?.opacity ?? 0.95;

      const isVideo = /\.(mp4|mov|webm|avi)$/i.test(asset.filePath);
      if (isVideo) {
        await execAsync(
          `ffmpeg -y -i "${baseVideoPath}" -i "${asset.filePath}" ` +
          `-filter_complex "[1:v]scale=${pw}:${ph}[overlay];[0:v][overlay]overlay=${px}:${py}:format=auto" ` +
          `-c:v libx264 -pix_fmt yuv420p -c:a copy "${out}"`,
          { timeout: 60000 }
        );
      } else {
        // Static image overlay
        await execAsync(
          `ffmpeg -y -i "${baseVideoPath}" -i "${asset.filePath}" ` +
          `-filter_complex "[1:v]scale=${pw}:${ph},format=rgba,colorchannelmixer=aa=${opacity}[overlay];[0:v][overlay]overlay=${px}:${py}" ` +
          `-c:v libx264 -pix_fmt yuv420p -c:a copy "${out}"`,
          { timeout: 60000 }
        );
      }
      break;

    case 'overlay_corner':
      // Logo in corner (e.g. FSP logo bottom-right)
      const lw = asset.compositeParams?.width ?? 120;
      const lh = asset.compositeParams?.height ?? 120;
      const lx = asset.compositeParams?.x ?? 920; // bottom-right for 1080 wide
      const ly = asset.compositeParams?.y ?? 1760; // bottom area for 1920 tall
      await execAsync(
        `ffmpeg -y -i "${baseVideoPath}" -i "${asset.filePath}" ` +
        `-filter_complex "[1:v]scale=${lw}:${lh},format=rgba,colorchannelmixer=aa=0.8[logo];[0:v][logo]overlay=${lx}:${ly}" ` +
        `-c:v libx264 -pix_fmt yuv420p -c:a copy "${out}"`,
        { timeout: 60000 }
      );
      break;

    case 'lower_third':
      // Lower third overlay (name/title bar)
      const ltHeight = asset.compositeParams?.height ?? 200;
      const ltY = asset.compositeParams?.y ?? 1600;
      await execAsync(
        `ffmpeg -y -i "${baseVideoPath}" -i "${asset.filePath}" ` +
        `-filter_complex "[1:v]scale=1080:${ltHeight},format=rgba,colorchannelmixer=aa=0.9[lt];[0:v][lt]overlay=0:${ltY}" ` +
        `-c:v libx264 -pix_fmt yuv420p -c:a copy "${out}"`,
        { timeout: 60000 }
      );
      break;

    case 'fullscreen':
      // Full frame replacement with the source asset
      await execAsync(
        `ffmpeg -y -i "${asset.filePath}" -c:v libx264 -r 30 -pix_fmt yuv420p ` +
        `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" ` +
        `-c:a aac -b:a 128k "${out}"`,
        { timeout: 60000 }
      );
      break;

    default:
      throw new Error(`Unknown composite mode: ${mode}`);
  }

  return out;
}

/**
 * Trim a source video clip to a specific duration
 */
export async function trimSourceClip(
  inputPath: string,
  startSeconds: number,
  durationSeconds: number
): Promise<string> {
  const out = join(ASSETS_DIR, 'composited', `trim_${uuidv4().slice(0, 8)}.mp4`);
  mkdirSync(dirname(out), { recursive: true });

  await execAsync(
    `ffmpeg -y -ss ${startSeconds} -i "${inputPath}" -t ${durationSeconds} ` +
    `-c:v libx264 -r 30 -pix_fmt yuv420p -c:a aac -b:a 128k "${out}"`,
    { timeout: 60000 }
  );

  return out;
}

/**
 * Create a brand card (text + logo on branded background)
 */
export async function createBrandCard(
  text: string,
  logoPath?: string,
  durationSeconds: number = 3,
  bgColor: string = 'black'
): Promise<string> {
  const out = join(ASSETS_DIR, 'composited', `brand_${uuidv4().slice(0, 8)}.mp4`);
  mkdirSync(dirname(out), { recursive: true });

  let filterChain = `color=c=${bgColor}:s=1080x1920:d=${durationSeconds}:r=30`;
  filterChain += `,drawtext=text='${text.replace(/'/g, "\\'")}':fontsize=32:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/System/Library/Fonts/Helvetica.ttc`;

  if (logoPath && existsSync(logoPath)) {
    // Add logo below the text
    await execAsync(
      `ffmpeg -y -f lavfi -i "${filterChain}" -i "${logoPath}" ` +
      `-filter_complex "[1:v]scale=200:-1[logo];[0:v][logo]overlay=(W-w)/2:H*0.7" ` +
      `-c:v libx264 -pix_fmt yuv420p -t ${durationSeconds} "${out}"`,
      { timeout: 30000 }
    );
  } else {
    await execAsync(
      `ffmpeg -y -f lavfi -i "${filterChain}" -c:v libx264 -pix_fmt yuv420p -t ${durationSeconds} "${out}"`,
      { timeout: 30000 }
    );
  }

  return out;
}
