import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../../assets/outputs');
const MEDIA_PIPELINE_URL = process.env.MEDIA_PIPELINE_URL || 'http://localhost:9004';
const FFMPEG_BIN = process.env.FFMPEG_BIN || '/Users/sayanmukherjee/.local/bin/ffmpeg';

interface CompileOptions {
  title: string;
  frameUrls: string[];
  voiceoverUrl?: string;
  musicUrl?: string;
  sceneAudioUrls?: string[];
  storyboard?: unknown;
}

// ── Caption types (mirrors client CaptionConfig) ─────────────────────────────

export interface CaptionConfig {
  font: 'Inter' | 'Oswald' | 'Bebas Neue' | 'JetBrains Mono' | 'custom';
  customFontUrl?: string;
  position: 'bottom' | 'center' | 'top';
  style: 'word_reveal' | 'block_subtitle' | 'kinetic_text';
  fontSize?: number;
  color?: string;
  bgColor?: string;
  bgOpacity?: number;
}

interface StoryboardSceneForCaption {
  captionText?: string;
  captionStyle?: 'word_reveal' | 'block_subtitle' | 'kinetic_text' | 'none';
  clipDuration: number;
}

export async function compileVideo(options: CompileOptions): Promise<{
  videoUrl: string;
  jobId: string;
  status: string;
}> {
  const { title, frameUrls, voiceoverUrl } = options;

  // Option 1: Use existing media-pipeline Remotion renderer if available
  try {
    const mediaPipelineResult = await compileWithMediaPipeline(options);
    return mediaPipelineResult;
  } catch (err) {
    console.warn('Media pipeline unavailable, using direct FFmpeg compilation:', err);
    return compileWithFFmpeg(options);
  }
}

async function compileWithMediaPipeline(options: CompileOptions): Promise<{
  videoUrl: string;
  jobId: string;
  status: string;
}> {
  const { title, frameUrls, voiceoverUrl } = options;

  // Build absolute URLs for the media pipeline
  const resolvedFrameUrls = frameUrls.map((url) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:${process.env.PORT || 3420}${url}`;
  });

  const resolvedVoiceover = voiceoverUrl
    ? voiceoverUrl.startsWith('http') ? voiceoverUrl : `http://localhost:${process.env.PORT || 3420}${voiceoverUrl}`
    : undefined;

  const renderPayload = {
    slides: resolvedFrameUrls,
    voiceoverUrl: resolvedVoiceover,
    reportTitle: title,
    reportUrl: 'story-engine',
  };

  const response = await fetch(`${MEDIA_PIPELINE_URL}/render-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(renderPayload),
  });

  if (!response.ok) {
    throw new Error(`Media pipeline error: ${response.status}`);
  }

  const result = await response.json() as { jobId: string; status: string; pollUrl: string };

  // Poll for completion (max 5 min)
  const jobId = result.jobId;
  let attempts = 0;
  while (attempts < 60) {
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;

    const statusRes = await fetch(`${MEDIA_PIPELINE_URL}${result.pollUrl}`);
    const statusData = await statusRes.json() as { status: string; videoUrl?: string; progress?: number };

    if (statusData.status === 'completed' && statusData.videoUrl) {
      // Translate media-pipeline URL to story-engine proxy URL
      return {
        videoUrl: `/proxy/media${statusData.videoUrl}`,
        jobId,
        status: 'completed',
      };
    }

    if (statusData.status === 'failed') {
      throw new Error('Media pipeline render failed');
    }
  }

  throw new Error('Render timed out after 5 minutes');
}

async function compileWithFFmpeg(options: CompileOptions): Promise<{
  videoUrl: string;
  jobId: string;
  status: string;
}> {
  const { frameUrls, musicUrl, voiceoverUrl } = options;
  const jobId = `compile_${uuidv4().slice(0, 8)}`;
  const subdir = join(ASSETS_DIR, 'compiled');
  mkdirSync(subdir, { recursive: true });

  if (frameUrls.length === 0) {
    throw new Error('No clips to compile');
  }

  const { writeFileSync } = await import('fs');

  // Resolve all URLs to local paths
  const resolvePath = (url: string) =>
    url.startsWith('/assets/outputs/')
      ? join(ASSETS_DIR, url.replace('/assets/outputs/', ''))
      : url;

  // Step 1: Re-encode all clips to consistent format for concat
  const normalizedClips: string[] = [];
  for (let i = 0; i < frameUrls.length; i++) {
    const input = resolvePath(frameUrls[i]);
    const norm = join(subdir, `${jobId}_clip${i}.mp4`);

    // Check if input is video or image
    const isImage = /\.(png|jpg|jpeg|webp)$/i.test(input);
    if (isImage) {
      // Convert image to 5s video clip with Ken Burns
      await execAsync(
        `ffmpeg -y -loop 1 -i "${input}" -c:v libx264 -t 5 -r 30 -pix_fmt yuv420p ` +
        `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.001,1.3)':d=150:s=1080x1920" ` +
        `"${norm}"`,
        { timeout: 60000 }
      );
    } else {
      // Re-encode video to consistent format
      await execAsync(
        `ffmpeg -y -i "${input}" -c:v libx264 -r 30 -pix_fmt yuv420p ` +
        `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" ` +
        `-c:a aac -b:a 128k "${norm}"`,
        { timeout: 60000 }
      );
    }
    normalizedClips.push(norm);
  }

  // Step 2: Concatenate with crossfade transitions between clips (0.5s dissolve)
  let concatResult: string;
  if (normalizedClips.length === 1) {
    concatResult = normalizedClips[0];
  } else {
    // Build xfade filter chain for dissolves between clips
    const concatPath = join(subdir, `${jobId}_concat.mp4`);
    const inputs = normalizedClips.map(c => `-i "${c}"`).join(' ');

    // For simplicity with variable clip counts, use concat demuxer with crossfade
    // Simple approach: concat first, then we can add dissolves in a future pass
    const listPath = join(subdir, `${jobId}_list.txt`);
    writeFileSync(listPath, normalizedClips.map(c => `file '${c}'`).join('\n'));
    await execAsync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${concatPath}"`,
      { timeout: 120000 }
    );
    concatResult = concatPath;
  }

  // Step 3: Mix SFX into one ambient track if available
  const { sceneAudioUrls = [] } = options;
  let sfxMixPath: string | null = null;
  const validSfx = sceneAudioUrls.map(resolvePath).filter(p => existsSync(p));
  if (validSfx.length > 0) {
    sfxMixPath = join(subdir, `${jobId}_sfx_mix.wav`);
    if (validSfx.length === 1) {
      await execAsync(`cp "${validSfx[0]}" "${sfxMixPath}"`);
    } else {
      // Mix multiple SFX files with offset timing (each one plays sequentially per scene)
      const inputs = validSfx.map(p => `-i "${p}"`).join(' ');
      const filters = validSfx.map((_, i) => {
        const delayMs = i * 5000; // rough 5s per scene offset — ideally from clipDuration
        return `[${i}]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=${delayMs}|${delayMs},volume=0.5[sfx${i}]`;
      }).join(';');
      const mixInputs = validSfx.map((_, i) => `[sfx${i}]`).join('');
      await execAsync(
        `ffmpeg -y ${inputs} -filter_complex "${filters};${mixInputs}amix=inputs=${validSfx.length}:duration=longest[out]" -map "[out]" "${sfxMixPath}"`,
        { timeout: 60000 }
      );
    }
  }

  // Step 4: Final audio mix — VO + Music + SFX → one master audio track
  const outputPath = join(subdir, `${jobId}.mp4`);
  const musicPath = musicUrl ? resolvePath(musicUrl) : null;
  const voPath = voiceoverUrl ? resolvePath(voiceoverUrl) : null;

  // Build dynamic FFmpeg mix command based on available audio tracks
  const audioInputs: string[] = [];
  const filterParts: string[] = [];
  const mixLabels: string[] = [];
  let inputIdx = 1; // 0 is video

  if (voPath && existsSync(voPath)) {
    audioInputs.push(`-i "${voPath}"`);
    filterParts.push(`[${inputIdx}:a]volume=1.0[vo]`);
    mixLabels.push('[vo]');
    inputIdx++;
  }
  if (musicPath && existsSync(musicPath)) {
    audioInputs.push(`-i "${musicPath}"`);
    filterParts.push(`[${inputIdx}:a]volume=0.25[mu]`);
    mixLabels.push('[mu]');
    inputIdx++;
  }
  if (sfxMixPath && existsSync(sfxMixPath)) {
    audioInputs.push(`-i "${sfxMixPath}"`);
    filterParts.push(`[${inputIdx}:a]volume=0.4[sfx]`);
    mixLabels.push('[sfx]');
    inputIdx++;
  }

  if (mixLabels.length > 0) {
    const filterComplex = `${filterParts.join(';')};${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=first[mixed]`;
    await execAsync(
      `ffmpeg -y -i "${concatResult}" ${audioInputs.join(' ')} ` +
      `-filter_complex "${filterComplex}" ` +
      `-map 0:v -map "[mixed]" -c:v copy -c:a aac -b:a 192k -shortest "${outputPath}"`,
      { timeout: 120000 }
    );
  } else {
    if (concatResult !== outputPath) {
      await execAsync(`cp "${concatResult}" "${outputPath}"`);
    }
  }

  return {
    videoUrl: `/assets/outputs/compiled/${jobId}.mp4`,
    jobId,
    status: 'completed',
  };
}

// ── Caption Burning ──────────────────────────────────────────────────────────

/**
 * Resolve a font name to a fontfile path for FFmpeg drawtext.
 * Falls back to Helvetica (system font on macOS).
 */
function resolveFontFile(font: CaptionConfig['font'], customFontUrl?: string): string {
  const fontMap: Record<string, string> = {
    'Inter': '/System/Library/Fonts/Helvetica.ttc',
    'Oswald': '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    'Bebas Neue': '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    'JetBrains Mono': '/System/Library/Fonts/Supplemental/Courier New.ttf',
    'custom': customFontUrl || '/System/Library/Fonts/Helvetica.ttc',
  };
  const resolved = fontMap[font] || '/System/Library/Fonts/Helvetica.ttc';
  return existsSync(resolved) ? resolved : '/System/Library/Fonts/Helvetica.ttc';
}

/**
 * Convert a position name to an FFmpeg y-expression for 1080x1920 (9:16).
 */
function positionToY(position: CaptionConfig['position']): string {
  switch (position) {
    case 'top': return 'h*0.12';
    case 'center': return '(h-text_h)/2';
    case 'bottom':
    default: return 'h*0.82';
  }
}

/**
 * Escape text for FFmpeg drawtext filter.
 * Must escape: single quotes, colons, backslashes, semicolons, and brackets.
 */
function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, '\\\\\\\\')
    .replace(/'/g, "'\\\\\\''")
    .replace(/:/g, '\\:')
    .replace(/;/g, '\\;')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/%/g, '%%');
}

/**
 * Convert a hex color like "#FFFFFF" to an FFmpeg color string "0xFFFFFF".
 * Also handles "0xRRGGBB" format and plain color names.
 */
function toFFmpegColor(color: string): string {
  if (color.startsWith('#')) return color.replace('#', '0x');
  if (color.startsWith('0x')) return color;
  return color; // named color like "white"
}

/**
 * Build FFmpeg drawtext filter(s) for a single scene's caption in block_subtitle style.
 * Shows the full caption text as a subtitle bar for the entire scene duration.
 */
function buildBlockSubtitleFilter(
  text: string,
  startTime: number,
  endTime: number,
  config: CaptionConfig,
  fontFile: string,
): string {
  const escaped = escapeDrawtext(text);
  const fontSize = config.fontSize || 48;
  const color = toFFmpegColor(config.color || '#FFFFFF');
  const bgColor = toFFmpegColor(config.bgColor || '#000000');
  const bgOpacity = config.bgOpacity ?? 0.6;

  // Background box with opacity: bordercolor and box with specified alpha
  const alphaHex = Math.round(bgOpacity * 255).toString(16).padStart(2, '0').toUpperCase();
  const yExpr = positionToY(config.position);

  return `drawtext=fontfile='${fontFile}':text='${escaped}':fontsize=${fontSize}:fontcolor=${color}:` +
    `x=(w-text_w)/2:y=${yExpr}:` +
    `box=1:boxcolor=${bgColor}@0x${alphaHex}:boxborderw=12:` +
    `enable='between(t,${startTime.toFixed(3)},${endTime.toFixed(3)})'`;
}

/**
 * Build FFmpeg drawtext filter(s) for word_reveal style.
 * Each word appears sequentially, evenly timed across the scene duration.
 */
function buildWordRevealFilters(
  text: string,
  startTime: number,
  endTime: number,
  config: CaptionConfig,
  fontFile: string,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const sceneDuration = endTime - startTime;
  const fontSize = config.fontSize || 48;
  const color = toFFmpegColor(config.color || '#FFFFFF');
  const bgColor = toFFmpegColor(config.bgColor || '#000000');
  const bgOpacity = config.bgOpacity ?? 0.6;
  const alphaHex = Math.round(bgOpacity * 255).toString(16).padStart(2, '0').toUpperCase();
  const yExpr = positionToY(config.position);

  const filters: string[] = [];

  // Each word gets a cumulative phrase — word 1 shows "word1", word 2 shows "word1 word2", etc.
  // This creates the "reveal" effect where text builds up
  for (let i = 0; i < words.length; i++) {
    const phrase = words.slice(0, i + 1).join(' ');
    const escaped = escapeDrawtext(phrase);
    const wordStart = startTime + (i / words.length) * sceneDuration;
    const wordEnd = (i < words.length - 1)
      ? startTime + ((i + 1) / words.length) * sceneDuration
      : endTime;

    filters.push(
      `drawtext=fontfile='${fontFile}':text='${escaped}':fontsize=${fontSize}:fontcolor=${color}:` +
      `x=(w-text_w)/2:y=${yExpr}:` +
      `box=1:boxcolor=${bgColor}@0x${alphaHex}:boxborderw=12:` +
      `enable='between(t,${wordStart.toFixed(3)},${wordEnd.toFixed(3)})'`
    );
  }

  return filters;
}

/**
 * Burns captions into a compiled video as a post-processing step.
 *
 * @param videoPath - Absolute path to the compiled video (or URL starting with /assets/outputs/)
 * @param scenes - Storyboard scenes with captionText, captionStyle, and clipDuration
 * @param captionConfig - Visual config: font, position, style override, fontSize, colors
 * @returns Path to the captioned video (URL format)
 */
export async function burnCaptions(
  videoPath: string,
  scenes: StoryboardSceneForCaption[],
  captionConfig: CaptionConfig,
): Promise<string> {
  // Resolve videoPath to an absolute filesystem path
  const resolvedVideoPath = videoPath.startsWith('/assets/outputs/')
    ? join(ASSETS_DIR, videoPath.replace('/assets/outputs/', ''))
    : videoPath;

  if (!existsSync(resolvedVideoPath)) {
    throw new Error(`Video file not found for caption burning: ${resolvedVideoPath}`);
  }

  // Collect scenes that actually have captions
  const captionedScenes = scenes.filter(
    (s) => s.captionText && s.captionText.trim().length > 0 && s.captionStyle !== 'none'
  );

  if (captionedScenes.length === 0) {
    console.log('  [burnCaptions] No caption text found in any scene, skipping.');
    return videoPath; // Return original — nothing to burn
  }

  const fontFile = resolveFontFile(captionConfig.font, captionConfig.customFontUrl);
  console.log(`  [burnCaptions] Using font: ${fontFile}`);

  // Calculate cumulative timecodes from clipDuration
  const drawFilters: string[] = [];
  let cumulativeTime = 0;

  for (const scene of scenes) {
    const startTime = cumulativeTime;
    const endTime = cumulativeTime + scene.clipDuration;
    cumulativeTime = endTime;

    if (!scene.captionText || scene.captionText.trim().length === 0 || scene.captionStyle === 'none') {
      continue;
    }

    // Determine effective style: use captionConfig.style as the global override,
    // but fall back to scene-level captionStyle
    const effectiveStyle = captionConfig.style || scene.captionStyle || 'block_subtitle';

    switch (effectiveStyle) {
      case 'word_reveal': {
        const wordFilters = buildWordRevealFilters(
          scene.captionText, startTime, endTime, captionConfig, fontFile
        );
        drawFilters.push(...wordFilters);
        break;
      }
      case 'block_subtitle':
      case 'kinetic_text': // kinetic_text falls back to block_subtitle for FFmpeg (no keyframe animation in drawtext)
      default: {
        drawFilters.push(
          buildBlockSubtitleFilter(scene.captionText, startTime, endTime, captionConfig, fontFile)
        );
        break;
      }
    }
  }

  if (drawFilters.length === 0) {
    console.log('  [burnCaptions] No drawable filters generated, skipping.');
    return videoPath;
  }

  // Build output path
  const subdir = join(ASSETS_DIR, 'compiled');
  mkdirSync(subdir, { recursive: true });
  const captionedJobId = `captioned_${uuidv4().slice(0, 8)}`;
  const outputPath = join(subdir, `${captionedJobId}.mp4`);

  // Combine all drawtext filters into a single filter_complex chain
  const filterChain = drawFilters.join(',');

  const cmd = `${FFMPEG_BIN} -y -i "${resolvedVideoPath}" ` +
    `-filter_complex "${filterChain}" ` +
    `-c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p ` +
    `-c:a copy "${outputPath}"`;

  console.log(`  [burnCaptions] Running FFmpeg caption burn (${drawFilters.length} text overlays)...`);
  console.log(`  [burnCaptions] Command: ${cmd.slice(0, 200)}...`);

  try {
    const { stderr } = await execAsync(cmd, { timeout: 180000, maxBuffer: 10 * 1024 * 1024 });
    if (stderr) {
      // FFmpeg writes progress to stderr — only log errors
      const errorLines = stderr.split('\n').filter(l => l.includes('Error') || l.includes('error'));
      if (errorLines.length > 0) {
        console.warn('  [burnCaptions] FFmpeg warnings:', errorLines.join('\n'));
      }
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`  [burnCaptions] FFmpeg caption burn failed: ${errMsg}`);
    throw new Error(`Caption burn failed: ${errMsg}`);
  }

  if (!existsSync(outputPath)) {
    throw new Error('Caption burn produced no output file');
  }

  console.log(`  [burnCaptions] Captions burned successfully → ${outputPath}`);
  return `/assets/outputs/compiled/${captionedJobId}.mp4`;
}
