#!/usr/bin/env node
/**
 * Episode 1 "The Underdog — The Spark" full pipeline
 * Generates: frames → video clips → voiceovers → final compiled video (no captions)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS = join(ROOT, 'assets/outputs');
const SOURCES = join(ROOT, 'assets/sources');
const SERVER = `http://localhost:3420`;
const FFMPEG = process.env.FFMPEG_BIN || '/Users/sayanmukherjee/.local/bin/ffmpeg';

// FSP App Screenshots path
const APP_SCREENSHOTS = '/Users/sayanmukherjee/Desktop/FSP:LSC Master/FSP App Screenshots';

// Scene-to-screenshot mapping
// Only scenes where the storyboard calls for a UI screen focus (not Kofi in the frame)
// Scene 12: phone propped showing recording interface
// Scene 14: upload button close-up — but storyboard has Kofi's thumb, so generate it
// Most scenes should use Imagen since the storyboard prompts are character-specific
const SCREENSHOT_SCENES = {
  // No scenes use raw screenshots — the storyboard imagePrompts are specific enough
  // App UI elements are described within the prompts themselves
};

// Load storyboard scenes
const scenes = JSON.parse(readFileSync('/tmp/ep1_scenes.json', 'utf-8'));
console.log(`\n🎬 Episode 1 Pipeline — ${scenes.length} scenes\n`);

// Ensure output dirs
for (const d of ['frames', 'animations', 'voiceovers', 'compiled']) {
  mkdirSync(join(ASSETS, d), { recursive: true });
}

// ── Helper: call server API ─────────────────────────────────────────────────

async function callAPI(nodeType, nodeData, inputData = {}) {
  const res = await fetch(`${SERVER}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeType, nodeData, inputData }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`API ${nodeType}: ${json.error}`);
  return json;
}

// ── Helper: generate image with retry (Imagen 4 → OpenRouter fallback) ──────

async function generateFrame(scene) {
  const num = scene.sceneNumber;

  // If this scene uses an app screenshot, copy it and return
  if (SCREENSHOT_SCENES[num]) {
    const src = join(APP_SCREENSHOTS, SCREENSHOT_SCENES[num]);
    const dest = join(ASSETS, 'frames', `scene_${String(num).padStart(2, '0')}.png`);
    copyFileSync(src, dest);
    console.log(`  📱 Scene ${num}: Using app screenshot ${SCREENSHOT_SCENES[num]}`);
    return { imageUrl: `/assets/outputs/frames/scene_${String(num).padStart(2, '0')}.png`, localPath: dest };
  }

  // Use the storyboard's imagePrompt exactly as written — it already contains
  // scene-specific character descriptions, camera angles, lighting, and negatives
  const prompt = scene.imagePrompt || scene.actionPrompt || '';

  // Build style from storyboard color palette
  const colorInfo = scene.colorPalette;
  const styleStr = colorInfo
    ? `${colorInfo.lut || 'cinematic'}. Shadows: ${colorInfo.shadows || 'teal-black'}. Midtones: ${colorInfo.midtones || 'warm amber'}. Highlights: ${colorInfo.highlights || 'cool white'}.`
    : 'cinematic sports documentary, teal-black shadows, warm amber skin tones';

  try {
    const result = await callAPI('frameGenerator', {
      imagePrompt: prompt,
      style: styleStr,
      aspectRatio: '9:16',
    });
    const imageUrl = result.outputs?.image || result.outputs?.frame?.imageUrl;
    console.log(`  🖼  Scene ${num}: Generated via Imagen 4`);

    // Rename to consistent path
    const destName = `scene_${String(num).padStart(2, '0')}.png`;
    const srcPath = join(ASSETS, imageUrl.replace('/assets/outputs/', ''));
    const destPath = join(ASSETS, 'frames', destName);
    if (existsSync(srcPath) && srcPath !== destPath) {
      copyFileSync(srcPath, destPath);
    }
    return { imageUrl: `/assets/outputs/frames/${destName}`, localPath: destPath };
  } catch (err) {
    console.warn(`  ⚠️  Scene ${num}: Imagen 4 failed (${err.message}), trying OpenRouter...`);
    return generateFrameOpenRouter(scene, prompt);
  }
}

// ── OpenRouter fallback for image generation ────────────────────────────────

async function generateFrameOpenRouter(scene, prompt) {
  const num = scene.sceneNumber;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OPENROUTER_API_KEY for fallback');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [{ role: 'user', content: `Generate this image: ${prompt}` }],
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '2:3', image_size: '1K' },
    }),
  });

  const json = await res.json();
  const imageData = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!imageData) {
    // Try another model
    console.warn(`  ⚠️  Scene ${num}: OpenRouter gemini-flash failed, trying gpt-image...`);
    const res2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-image-mini',
        messages: [{ role: 'user', content: `Generate this image: ${prompt}` }],
        modalities: ['image', 'text'],
        image_config: { aspect_ratio: '2:3', image_size: '1K' },
      }),
    });
    const json2 = await res2.json();
    const imageData2 = json2.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData2) throw new Error(`OpenRouter returned no image for scene ${num}`);
    return saveBase64Image(imageData2, num);
  }

  return saveBase64Image(imageData, num);
}

function saveBase64Image(dataUrl, sceneNum) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const destName = `scene_${String(sceneNum).padStart(2, '0')}.png`;
  const destPath = join(ASSETS, 'frames', destName);
  writeFileSync(destPath, buffer);
  console.log(`  🖼  Scene ${sceneNum}: Generated via OpenRouter fallback`);
  return { imageUrl: `/assets/outputs/frames/${destName}`, localPath: destPath };
}

// ── Generate voiceover ──────────────────────────────────────────────────────

async function generateVoiceover(scene) {
  const num = scene.sceneNumber;
  const script = scene.voiceoverText;
  if (!script || script.trim().length < 5) {
    console.log(`  🔇 Scene ${num}: No voiceover text, skipping`);
    return null;
  }

  const profile = scene.narratorProfile || 'sports_doc';

  try {
    const result = await callAPI('voiceover', {
      narratorProfile: profile,
      script,
    });
    const audioUrl = result.outputs?.audio || result.dataUpdates?.audioUrl;
    console.log(`  🎙  Scene ${num}: VO generated (${result.dataUpdates?.durationSeconds?.toFixed(1)}s)`);

    // Copy to consistent path
    const destName = `scene_${String(num).padStart(2, '0')}.mp3`;
    const srcPath = join(ASSETS, audioUrl.replace('/assets/outputs/', ''));
    const destPath = join(ASSETS, 'voiceovers', destName);
    if (existsSync(srcPath)) copyFileSync(srcPath, destPath);
    return { audioUrl: `/assets/outputs/voiceovers/${destName}`, localPath: destPath, duration: result.dataUpdates?.durationSeconds };
  } catch (err) {
    console.error(`  ❌ Scene ${num}: VO failed: ${err.message}`);
    return null;
  }
}

// ── Animate frame → video clip ──────────────────────────────────────────────

// FFmpeg motion presets (from animationService)
const MOTION_PRESETS = {
  static: "zoompan=z='1':d=FRAMES:fps=30",
  push_in: "zoompan=z='min(zoom+0.002,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=FRAMES:fps=30",
  pull_out: "zoompan=z='if(eq(on,1),1.5,max(zoom-0.002,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=FRAMES:fps=30",
  handheld: "zoompan=z='1+0.01*sin(on/5)':x='iw/2-(iw/zoom/2)+3*sin(on/7)':y='ih/2-(ih/zoom/2)+3*cos(on/9)':d=FRAMES:fps=30",
  phone_propped: "zoompan=z='1+0.005*sin(on/8)':x='iw/2-(iw/zoom/2)+2*sin(on/10)':y='ih/2-(ih/zoom/2)+2*cos(on/12)':d=FRAMES:fps=30",
  drift_up: "zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='if(gte(on,1),max(y-0.5,0),ih*0.3)':d=FRAMES:fps=30",
  ken_burns: "zoompan=z='min(zoom+0.0015,1.4)':x='if(gte(on,1),min(x+1,iw),0)':y='ih/2-(ih/zoom/2)':d=FRAMES:fps=30",
  snap_zoom: "zoompan=z='if(lt(on,30),1+on*0.02,1.6)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=FRAMES:fps=30",
};

async function animateToClip(scene, frameResult) {
  const num = scene.sceneNumber;
  const dur = scene.clipDuration || 4;
  const preset = scene.cameraPreset || 'static';
  const totalFrames = dur * 30;

  const filter = (MOTION_PRESETS[preset] || MOTION_PRESETS.static).replace(/FRAMES/g, String(totalFrames));
  const outPath = join(ASSETS, 'animations', `clip_${String(num).padStart(2, '0')}.mp4`);

  const cmd = `${FFMPEG} -y -loop 1 -i "${frameResult.localPath}" ` +
    `-vf "${filter},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" ` +
    `-c:v libx264 -t ${dur} -pix_fmt yuv420p -r 30 "${outPath}"`;

  try {
    await execAsync(cmd, { timeout: 60000 });
    console.log(`  🎥 Scene ${num}: Animated (${preset}, ${dur}s)`);
  } catch (err) {
    console.error(`  ❌ Scene ${num}: Animation failed: ${err.message}`);
    // Fallback: simple static clip
    const fallbackCmd = `${FFMPEG} -y -loop 1 -i "${frameResult.localPath}" ` +
      `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" ` +
      `-c:v libx264 -t ${dur} -pix_fmt yuv420p -r 30 "${outPath}"`;
    await execAsync(fallbackCmd, { timeout: 60000 });
    console.log(`  🎥 Scene ${num}: Fallback static clip (${dur}s)`);
  }

  return { videoUrl: `/assets/outputs/animations/clip_${String(num).padStart(2, '0')}.mp4`, localPath: outPath };
}

// ── Compile all clips + VO → final video ────────────────────────────────────

async function compileVideo(clipResults, voResults) {
  console.log('\n📼 Compiling final video...');
  const compileDir = join(ASSETS, 'compiled');
  mkdirSync(compileDir, { recursive: true });

  // 1. Concatenate all scene clips
  const listPath = join(compileDir, 'ep1_concat_list.txt');
  const lines = clipResults.map(c => `file '${c.localPath}'`).join('\n');
  writeFileSync(listPath, lines);

  const concatPath = join(compileDir, 'ep1_concat.mp4');
  await execAsync(
    `${FFMPEG} -y -f concat -safe 0 -i "${listPath}" -c copy "${concatPath}"`,
    { timeout: 120000 }
  );
  console.log('  ✅ Clips concatenated');

  // 2. Merge all VOs into one continuous track
  const voListPath = join(compileDir, 'ep1_vo_list.txt');
  const voFiles = [];
  let silenceIdx = 0;

  for (let i = 0; i < scenes.length; i++) {
    const vo = voResults[i];
    const dur = scenes[i].clipDuration || 4;

    if (vo && existsSync(vo.localPath)) {
      voFiles.push(`file '${vo.localPath}'`);
    } else {
      // Generate silence for this scene's duration
      const silPath = join(compileDir, `silence_${silenceIdx++}.mp3`);
      await execAsync(
        `${FFMPEG} -y -f lavfi -i anullsrc=r=44100:cl=stereo -t ${dur} -c:a libmp3lame "${silPath}"`,
        { timeout: 10000 }
      );
      voFiles.push(`file '${silPath}'`);
    }
  }

  writeFileSync(voListPath, voFiles.join('\n'));
  const voMergedPath = join(compileDir, 'ep1_vo_merged.mp3');
  await execAsync(
    `${FFMPEG} -y -f concat -safe 0 -i "${voListPath}" -c copy "${voMergedPath}"`,
    { timeout: 60000 }
  );
  console.log('  ✅ Voiceovers merged');

  // 3. Mix video + voiceover
  const finalPath = join(compileDir, 'ep1_final.mp4');
  await execAsync(
    `${FFMPEG} -y -i "${concatPath}" -i "${voMergedPath}" ` +
    `-map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "${finalPath}"`,
    { timeout: 120000 }
  );

  console.log(`  ✅ Final video: ${finalPath}`);
  return finalPath;
}

// ── YouTube clip pre-extracted for Scene 2 ──────────────────────────────────
// Rally clip already extracted at assets/outputs/frames/yt_rally_b.mp4 (8min mark, mid first game)
const YT_CLIP_PATH = join(ASSETS, 'frames', 'yt_rally_b.mp4');

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now();

  // ── Phase 1: Generate all frames (batched in groups of 4 to avoid rate limits) ──
  console.log('━━━ Phase 1: Frame Generation ━━━');

  const frameResults = [];
  const BATCH_SIZE = 4;

  for (let batch = 0; batch < scenes.length; batch += BATCH_SIZE) {
    const batchScenes = scenes.slice(batch, batch + BATCH_SIZE);
    console.log(`\n  Batch ${Math.floor(batch / BATCH_SIZE) + 1}/${Math.ceil(scenes.length / BATCH_SIZE)}:`);

    const batchResults = await Promise.all(
      batchScenes.map(scene => generateFrame(scene).catch(err => {
        console.error(`  ❌ Scene ${scene.sceneNumber}: ${err.message}`);
        return null;
      }))
    );
    frameResults.push(...batchResults);

    // Brief pause between batches to avoid rate limiting
    if (batch + BATCH_SIZE < scenes.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // YouTube clip for scene 2 is pre-extracted
  const ytClipPath = existsSync(YT_CLIP_PATH) ? YT_CLIP_PATH : null;
  if (ytClipPath) console.log('  📺 YouTube rally clip ready for Scene 2');

  // ── Phase 2: Generate voiceovers (batched) ──
  console.log('\n━━━ Phase 2: Voiceover Generation ━━━');

  const voResults = [];
  for (let batch = 0; batch < scenes.length; batch += BATCH_SIZE) {
    const batchScenes = scenes.slice(batch, batch + BATCH_SIZE);
    console.log(`\n  Batch ${Math.floor(batch / BATCH_SIZE) + 1}/${Math.ceil(scenes.length / BATCH_SIZE)}:`);

    const batchVOs = await Promise.all(
      batchScenes.map(scene => generateVoiceover(scene).catch(err => {
        console.error(`  ❌ Scene ${scene.sceneNumber}: ${err.message}`);
        return null;
      }))
    );
    voResults.push(...batchVOs);
  }

  // ── Phase 3: Animate frames → video clips ──
  console.log('\n━━━ Phase 3: Animation (frame → video clips) ━━━');

  const clipResults = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const num = scene.sceneNumber;

    // Scene 2: use YouTube clip if available
    if (num === 2 && ytClipPath) {
      clipResults.push({ videoUrl: `/assets/outputs/frames/scene_02_yt.mp4`, localPath: ytClipPath });
      console.log(`  🎥 Scene 2: Using YouTube clip`);
      continue;
    }

    if (!frameResults[i]) {
      console.error(`  ❌ Scene ${num}: No frame to animate, skipping`);
      clipResults.push(null);
      continue;
    }

    const clip = await animateToClip(scene, frameResults[i]);
    clipResults.push(clip);
  }

  // Filter out nulls and ensure we have at least some clips
  const validClips = clipResults.filter(Boolean);
  const validVOs = voResults; // Keep nulls for silence generation

  if (validClips.length === 0) {
    console.error('\n❌ No clips generated — cannot compile video');
    process.exit(1);
  }

  console.log(`\n  ✅ ${validClips.length}/${scenes.length} clips ready`);
  console.log(`  ✅ ${voResults.filter(Boolean).length}/${scenes.length} voiceovers ready`);

  // ── Phase 4: Compile final video ──
  console.log('\n━━━ Phase 4: Final Compilation ━━━');

  // Re-index clips (use valid clips only, matching voice order)
  const finalClips = [];
  const finalVOs = [];
  for (let i = 0; i < scenes.length; i++) {
    if (clipResults[i]) {
      finalClips.push(clipResults[i]);
      finalVOs.push(voResults[i]);
    }
  }

  const finalPath = await compileVideo(finalClips, finalVOs);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n🎬 Pipeline complete in ${elapsed}s`);
  console.log(`   Final video: ${finalPath}`);
  console.log(`   URL: ${SERVER}/assets/outputs/compiled/ep1_final.mp4`);
}

main().catch(err => {
  console.error('\n💥 Pipeline crashed:', err);
  process.exit(1);
});
