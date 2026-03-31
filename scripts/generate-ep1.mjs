#!/usr/bin/env node
/**
 * FSP — The Underdog: Episode 1 "The Spark"
 * Full generation pipeline using Freepik API
 * Budget: 5 EUR max
 *
 * Pipeline: Images (Mystic Realism) → Videos (Kling O1 Std) → Music → SFX → FFmpeg compile
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../output/ep1');
const API_KEY = 'FPSX9369560d8e558140272f807a1ba98bff';
const BASE = 'https://api.freepik.com/v1/ai';
const HEADERS = { 'x-freepik-api-key': API_KEY, 'Content-Type': 'application/json' };

// ── Helpers ──────────────────────────────────────────────────────────────────

async function api(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${endpoint} ${res.status}: ${txt}`);
  }
  return res.json();
}

async function poll(endpoint, taskId, label, maxWait = 300_000) {
  const start = Date.now();
  const pollUrl = `${BASE}${endpoint}/${taskId}`;
  process.stdout.write(`  ⏳ ${label} [${taskId.slice(0, 8)}]`);
  while (Date.now() - start < maxWait) {
    await sleep(5000);
    const res = await fetch(pollUrl, { headers: HEADERS });
    const json = await res.json();
    const status = json.data?.status;
    process.stdout.write('.');
    if (status === 'COMPLETED') {
      console.log(' ✓');
      return json.data.generated;
    }
    if (status === 'FAILED') {
      console.log(' ✗');
      throw new Error(`${label} FAILED: ${JSON.stringify(json)}`);
    }
  }
  throw new Error(`${label} timed out after ${maxWait / 1000}s`);
}

async function download(url, filepath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} for ${filepath}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(filepath, buf);
  console.log(`  📥 Saved: ${filepath} (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
  return filepath;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg) { console.log(`\n🎬 ${msg}`); }

// ── Episode 1 Scene Definitions ──────────────────────────────────────────────

const SCENES = [
  {
    id: 'scene1_2am',
    name: 'The Algorithm — 2am',
    imagePrompt: `Extreme close-up portrait, 9:16 vertical frame. Ghanaian-British man, 19 years old, dark brown skin, sharp jawline, short natural hair with tight fade. Lying in bed at 2am, face lit ONLY by phone screen glow from below-right. Cool blue-white light (6500K) illuminating cheekbones and wide transfixed eyes. Pure chiaroscuro — deep teal shadows, no ambient light at all. Phone shows a squash match on screen (faint blue glow). Dark bedroom barely visible behind him. His expression: involuntary fascination, mouth slightly open, pupils wide. Cinematic photorealistic, Barry Jenkins Moonlight color palette. 85mm lens f/1.4 razor shallow depth of field. NOT staged — documentary intimacy.`,
    videoPrompt: 'Very slow drift upward past the face, phone light subtly flickering on skin, completely still subject, breathing visible, cinematic 2am atmosphere',
    motionDuration: '5',
    sfx: 'phone notification chime in dark quiet bedroom at night, distant city hum',
  },
  {
    id: 'scene2_day1',
    name: 'Day 1 — Brixton Leisure Centre',
    imagePrompt: `Medium wide shot, 9:16 vertical frame, slight 4-degree dutch angle. Interior of a community leisure centre squash court. Overhead institutional fluorescent strip lights casting green-white 4000K light. Scuffed hardwood floor with faded red and white court markings. White walls covered in years of ball marks. Red TIN strip visible at bottom of front wall. A young Ghanaian-British man (19, dark brown skin, athletic build, faded dark charcoal Adidas hoodie, black Nike shorts, scuffed white Air Force 1s) stands mid-court looking slightly lost, holding a battered old wooden squash racket LEFT-HANDED. Ball on the floor — he just missed completely. He is laughing at himself. 24mm wide angle lens. Desaturated documentary grade, Ken Loach social realism aesthetic. The court dwarfs him — full height of walls visible. Authentic municipal sports facility, not a private club.`,
    videoPrompt: 'Slow Ken Burns pan from the scuffed floor up to the young man standing in the centre of the court, fluorescent lights buzzing overhead, the ball rolling slowly across the floor, documentary handheld feel',
    motionDuration: '5',
    sfx: 'squash ball bouncing on wooden floor in indoor court with echo, sneakers squeaking, fluorescent light buzz',
  },
  {
    id: 'scene3_app',
    name: 'The App Discovery',
    imagePrompt: `Medium close-up, 9:16 vertical, camera at chest height looking slightly up. Young Ghanaian-British man (19, dark brown skin, sharp jaw, short fade haircut) sitting on a worn wooden bench in a locker room changing area. Faded charcoal Adidas hoodie, sweaty at the collar. Holding phone with both hands, elbows on knees, leaning forward. Phone screen partially visible showing an app with leaderboard numbers and the words "WPS World Premier Squash Finals". DUAL LIGHTING: warm tungsten overhead practical (3200K amber) hitting right side of face + cool phone screen (6500K blue-white) hitting left cheek from below. The two colour temperatures split his face — warm right, cool left. His expression: something just changed, eyes wider, jaw set differently, a private recalibration moment. Background: olive green metal lockers slightly out of focus, worn black Nike drawstring bag on floor. Yellow squash ball visible. Cinematic 50mm f/2 lens. Rich saturated skin tones. Moonlight-intimate turning point composition.`,
    videoPrompt: 'Very slow push-in zoom toward his face, the phone screen light intensifying slightly on his left side, his expression deepening as he reads the app, subtle breath visible, intimate documentary moment',
    motionDuration: '5',
    sfx: 'phone tap scrolling sounds, locker room ambient echo, distant shower running, muffled voices',
  },
];

const VOICEOVER_SCRIPT = `100-day squash challenge. Day 1. I saw one Ramy Ashour video at 2am and I can't stop thinking about it. I've never played. Let's see what happens. This man is broken and he's still cooking. What is this sport. So apparently there's this app where you can film challenges, submit them, and get ranked against people all over the world. You can qualify for actual professional events. From your phone. What if I actually... no. That's insane. But what if.`;

// ── Pipeline Steps ───────────────────────────────────────────────────────────

async function generateImages() {
  log('STEP 1: Generating 3 key frames via Mystic Realism...');
  const tasks = [];

  for (const scene of SCENES) {
    console.log(`  🎨 Submitting: ${scene.name}`);
    const result = await api('/mystic', {
      prompt: scene.imagePrompt,
      resolution: '2k',
      aspect_ratio: 'social_story_9_16',
      styling: { model: 'realism' },
    });
    tasks.push({ scene, taskId: result.data.task_id });
    await sleep(1000); // Rate limit buffer
  }

  // Poll all image tasks
  const images = [];
  for (const { scene, taskId } of tasks) {
    const generated = await poll('/mystic', taskId, `Image: ${scene.name}`);
    const imgUrl = generated[0];
    const imgPath = join(OUT, `${scene.id}_frame.png`);
    await download(imgUrl, imgPath);
    images.push({ scene, imgPath, imgUrl });
  }
  return images;
}

async function generateVideos(images) {
  log('STEP 2: Animating frames via Kling O1 Standard (image-to-video)...');
  const tasks = [];

  for (const { scene, imgUrl } of images) {
    console.log(`  🎥 Submitting: ${scene.name} → video`);
    const result = await api('/image-to-video/kling-o1-std', {
      first_frame: imgUrl,
      prompt: scene.videoPrompt,
      duration: scene.motionDuration,
      aspect_ratio: '9:16',
    });
    tasks.push({ scene, taskId: result.data.task_id });
    await sleep(2000); // Rate limit
  }

  // Poll video tasks (these take longer — up to 5 min each)
  const videos = [];
  for (const { scene, taskId } of tasks) {
    const generated = await poll('/image-to-video/kling-o1', taskId, `Video: ${scene.name}`, 600_000);
    const vidUrl = generated[0];
    const vidPath = join(OUT, `${scene.id}_clip.mp4`);
    await download(vidUrl, vidPath);
    videos.push({ scene, vidPath });
  }
  return videos;
}

async function generateMusic() {
  log('STEP 3: Generating 60s cinematic underscore...');
  const result = await api('/music-generation', {
    prompt: 'Emotional cinematic piano underscore, documentary film score, starts quiet and intimate with solo piano, builds slowly with subtle strings, tension rising, hopeful but uncertain, minor key transitioning to cautiously optimistic. Think Moonlight or Manchester by the Sea soundtrack. 60 seconds.',
    music_length_seconds: 60,
  });
  const generated = await poll('/music-generation', result.data.task_id, 'Music: Ep1 underscore', 300_000);
  const musicPath = join(OUT, 'ep1_music.wav');
  await download(generated[0], musicPath);
  return musicPath;
}

async function generateSoundEffects() {
  log('STEP 4: Generating sound effects...');
  const sfxTasks = [];

  for (const scene of SCENES) {
    console.log(`  🔊 SFX: ${scene.name}`);
    const result = await api('/sound-effects', {
      text: scene.sfx,
      duration_seconds: 5,
    });
    sfxTasks.push({ scene, taskId: result.data.task_id });
    await sleep(1000);
  }

  const sfxPaths = [];
  for (const { scene, taskId } of sfxTasks) {
    const generated = await poll('/sound-effects', taskId, `SFX: ${scene.name}`);
    const sfxPath = join(OUT, `${scene.id}_sfx.wav`);
    await download(generated[0], sfxPath);
    sfxPaths.push(sfxPath);
  }
  return sfxPaths;
}

async function compileEpisode(videos, musicPath, sfxPaths) {
  log('STEP 5: Compiling final episode with FFmpeg...');

  // 1. Create a concat list for the 3 video clips
  const concatList = videos.map(v => `file '${v.vidPath}'`).join('\n');
  const concatFile = join(OUT, 'concat.txt');
  await writeFile(concatFile, concatList);

  // 2. Concatenate clips
  const rawConcat = join(OUT, 'ep1_raw_concat.mp4');
  console.log('  🔗 Concatenating 3 video clips...');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${rawConcat}" 2>/dev/null`);

  // 3. Mix sound effects into one ambient track
  const sfxMixed = join(OUT, 'ep1_sfx_mixed.wav');
  console.log('  🔊 Mixing sound effects...');
  // Each SFX plays at offset 0s, 5s, 10s (matching the 3 clips)
  execSync(`ffmpeg -y \
    -i "${sfxPaths[0]}" -i "${sfxPaths[1]}" -i "${sfxPaths[2]}" \
    -filter_complex "[0]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.4[a0]; \
    [1]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=5000|5000,volume=0.4[a1]; \
    [2]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=10000|10000,volume=0.4[a2]; \
    [a0][a1][a2]amix=inputs=3:duration=longest[out]" \
    -map "[out]" "${sfxMixed}" 2>/dev/null`);

  // 4. Get video duration
  const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${rawConcat}" 2>/dev/null`).toString().trim();
  const videoDur = parseFloat(durStr);
  console.log(`  ⏱  Video duration: ${videoDur.toFixed(1)}s`);

  // 5. Trim music to video length and mix everything together
  const finalOutput = join(OUT, 'EP1_THE_SPARK_FINAL.mp4');
  console.log('  🎬 Final mix: video + music + SFX...');
  execSync(`ffmpeg -y \
    -i "${rawConcat}" \
    -i "${musicPath}" \
    -i "${sfxMixed}" \
    -filter_complex "\
      [1:a]atrim=0:${videoDur},asetpts=PTS-STARTPTS,volume=0.5[music]; \
      [2:a]atrim=0:${videoDur},asetpts=PTS-STARTPTS,volume=0.7[sfx]; \
      [music][sfx]amix=inputs=2:duration=first[mixed]" \
    -map 0:v -map "[mixed]" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "${finalOutput}" 2>/dev/null`);

  console.log(`\n  ✅ EPISODE 1 COMPLETE: ${finalOutput}`);
  console.log(`     Duration: ~${videoDur.toFixed(0)}s`);

  return finalOutput;
}

// ── Title Card & Cliffhanger (FFmpeg text overlays) ──────────────────────────

async function addTitleAndCliffhanger(inputPath) {
  log('STEP 6: Adding title card + cliffhanger cut-to-black...');

  // Create a 3s black intro with title text
  const titleCard = join(OUT, 'ep1_title_card.mp4');
  // Get video dimensions
  const probe = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}" 2>/dev/null`).toString().trim();
  const [width, height] = probe.split(',').map(Number);

  execSync(`ffmpeg -y -f lavfi -i color=c=black:s=${width}x${height}:d=3:r=30 \
    -vf "drawtext=text='THE UNDERDOG':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40:fontfile=/System/Library/Fonts/Helvetica.ttc, \
    drawtext=text='Episode 1\\: The Spark':fontsize=28:fontcolor=0xAAAAAA:x=(w-text_w)/2:y=(h-text_h)/2+30:fontfile=/System/Library/Fonts/Helvetica.ttc" \
    -c:v libx264 -pix_fmt yuv420p -t 3 "${titleCard}" 2>/dev/null`);

  // Create 4s cliffhanger: 1s freeze → 3s black with text
  const cliffhanger = join(OUT, 'ep1_cliffhanger.mp4');
  execSync(`ffmpeg -y -f lavfi -i color=c=black:s=${width}x${height}:d=3:r=30 \
    -vf "drawtext=text='His first score drops next week.':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/System/Library/Fonts/Helvetica.ttc:enable='gt(t,1)'" \
    -c:v libx264 -pix_fmt yuv420p -t 3 "${cliffhanger}" 2>/dev/null`);

  // Concat: title → main → cliffhanger
  const finalConcat = join(OUT, 'ep1_final_concat.txt');
  await writeFile(finalConcat, `file '${titleCard}'\nfile '${inputPath}'\nfile '${cliffhanger}'`);

  // Need to re-encode main video to match title card codec
  const mainReencoded = join(OUT, 'ep1_main_reencoded.mp4');
  execSync(`ffmpeg -y -i "${inputPath}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k "${mainReencoded}" 2>/dev/null`);
  await writeFile(finalConcat, `file '${titleCard}'\nfile '${mainReencoded}'\nfile '${cliffhanger}'`);

  const fullEpisode = join(OUT, 'THE_UNDERDOG_EP1_THE_SPARK.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${finalConcat}" -c copy "${fullEpisode}" 2>/dev/null`);

  console.log(`\n  🏆 FINAL EPISODE WITH TITLES: ${fullEpisode}`);
  return fullEpisode;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  FSP — THE UNDERDOG: Episode 1 "The Spark"');
  console.log('  Full AI generation via Freepik API');
  console.log('  Budget: 5 EUR');
  console.log('═══════════════════════════════════════════════════════');

  await mkdir(OUT, { recursive: true });

  const startTime = Date.now();

  // Step 1: Generate key frame images
  const images = await generateImages();

  // Step 2: Animate frames into video clips
  const videos = await generateVideos(images);

  // Step 3 & 4: Music + SFX in parallel
  const [musicPath, sfxPaths] = await Promise.all([
    generateMusic(),
    generateSoundEffects(),
  ]);

  // Step 5: Compile everything
  const compiled = await compileEpisode(videos, musicPath, sfxPaths);

  // Step 6: Add title card and cliffhanger
  const finalEpisode = await addTitleAndCliffhanger(compiled);

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  ✅ DONE in ${elapsed} minutes`);
  console.log(`  📁 Output: ${OUT}/`);
  console.log(`  🎬 Final:  ${finalEpisode}`);
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n❌ FATAL:', err.message);
  process.exit(1);
});
