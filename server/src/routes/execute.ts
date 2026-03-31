import { Router } from 'express';
import { generateStoryConcept, generateStoryboard } from '../services/storyService.js';
import { generateCharacterImage, generateSceneFrame } from '../services/imageService.js';
import { generateVoiceover } from '../services/voiceoverService.js';
import { animateFrame } from '../services/animationService.js';
import { compileVideo, burnCaptions, CaptionConfig } from '../services/compileService.js';
import * as freepik from '../services/freepikService.js';
import { compositeAssetOntoVideo, trimSourceClip, createBrandCard } from '../services/sourceAssetService.js';
import type { SourceAsset } from '../services/sourceAssetService.js';
import { ExecuteNodeRequest, ExecuteNodeResponse, StoryJSON } from '../types.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

const useFreepik = () => !!process.env.FREEPIK_API_KEY;

/** Load source assets assigned to a specific scene from the manifest */
function getSourceAssetsForScene(sceneId: string): SourceAsset[] {
  const manifestPath = join(dirname(fileURLToPath(import.meta.url)), '../../../assets/sources/manifest.json');
  if (!existsSync(manifestPath)) return [];
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SourceAsset[];
    return manifest.filter(a => a.sceneAssignment === sceneId);
  } catch { return []; }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../../assets/outputs');

const router = Router();

// ── Reference types ──────────────────────────────────────────────────────────
interface ProjectReference {
  type: 'color_grading' | 'font' | 'style' | 'character' | 'audio' | 'other';
  label: string;
  url: string;
  notes?: string;
}

/** Build a prompt suffix from references relevant to a given generation type */
function buildRefContext(refs: ProjectReference[], ...types: ProjectReference['type'][]): string {
  const relevant = refs.filter(r => types.includes(r.type));
  if (relevant.length === 0) return '';

  const parts = relevant.map(r => {
    let line = `[${r.type.toUpperCase()} REF: "${r.label}"]`;
    if (r.notes) line += ` — ${r.notes}`;
    if (/\.(png|jpg|jpeg|webp|gif)$/i.test(r.url)) line += ` (image: ${r.url})`;
    return line;
  });

  return `\n\nPROJECT REFERENCES — use these to guide style, color, and tone:\n${parts.join('\n')}`;
}

router.post('/execute', async (req, res) => {
  const { nodeType, nodeData, inputData, references = [] } = req.body as ExecuteNodeRequest & { references?: ProjectReference[] };

  try {
    let result: ExecuteNodeResponse;

    switch (nodeType) {
      case 'storyConcept':
        result = await executeStoryConcept(nodeData, inputData, references);
        break;
      case 'character':
        result = await executeCharacter(nodeData, inputData, references);
        break;
      case 'storyboard':
        result = await executeStoryboard(nodeData, inputData, references);
        break;
      case 'frameGenerator':
        result = await executeFrameGenerator(nodeData, inputData, references);
        break;
      case 'animation':
        result = await executeAnimation(nodeData, inputData, references);
        break;
      case 'voiceover':
        result = await executeVoiceover(nodeData, inputData, references);
        break;
      case 'sfx':
        result = await executeSfx(nodeData, inputData, references);
        break;
      case 'music':
        result = await executeMusic(nodeData, inputData, references);
        break;
      case 'compile':
        result = await executeCompile(nodeData, inputData);
        break;
      case 'export':
        result = await executeExport(nodeData, inputData);
        break;
      default:
        return res.status(400).json({ error: `Unknown node type: ${nodeType}` });
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Node execution error (${nodeType}):`, message);
    res.status(500).json({ error: message });
  }
});

// ── Node Executors ────────────────────────────────────────────────────────────

async function executeStoryConcept(nodeData: Record<string, unknown>, _input: Record<string, unknown>, refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  let concept = nodeData.concept as string;
  const genre = nodeData.genre as string || 'Drama';
  const tone = nodeData.tone as string || 'Cinematic';
  const targetDuration = nodeData.targetDuration as number || 60;

  if (!concept || concept.trim().length < 10) {
    throw new Error('Please enter a story concept (at least 10 characters)');
  }

  // Inject style/audio refs into the concept so Claude uses them
  const refCtx = buildRefContext(refs, 'style', 'color_grading', 'audio');
  if (refCtx) concept = `${concept}${refCtx}`;

  const story = await generateStoryConcept(concept, genre, tone, targetDuration);

  return {
    outputs: { story, script: story.script },
    dataUpdates: {
      storyOutput: story,
      label: story.title.slice(0, 30),
    },
  };
}

async function executeCharacter(nodeData: Record<string, unknown>, input: Record<string, unknown>, refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  const characterName = nodeData.characterName as string;
  const description = nodeData.description as string;
  let style = nodeData.style as string || 'cinematic photorealistic';

  // Inject character + style refs
  const refCtx = buildRefContext(refs, 'character', 'style', 'color_grading');
  if (refCtx) style = `${style}${refCtx}`;

  if (!characterName) throw new Error('Character name is required');
  if (!description || description.length < 10) throw new Error('Character description is required (min 10 chars)');

  // If story input has character info, enrich the description
  const storyInput = input.story as StoryJSON | undefined;
  let enrichedDescription = description;
  if (storyInput?.characters) {
    const matching = storyInput.characters.find(
      (c) => c.name.toLowerCase().includes(characterName.toLowerCase())
    );
    if (matching) {
      enrichedDescription = `${description}. ${matching.visualDescription}`;
    }
  }

  // Gemini Imagen 4 > Freepik > DALL-E — imageService handles priority
  let imageUrl: string;
  if (process.env.GEMINI_API_KEY) {
    const result = await generateCharacterImage(characterName, enrichedDescription, style);
    imageUrl = result.imageUrl;
  } else if (useFreepik()) {
    const result = await freepik.generateCharacterRef(characterName, enrichedDescription, style);
    imageUrl = result.imageUrl;
  } else {
    const result = await generateCharacterImage(characterName, enrichedDescription, style);
    imageUrl = result.imageUrl;
  }

  return {
    outputs: {
      character: {
        id: `char_${Date.now()}`,
        name: characterName,
        description,
        visualDescription: enrichedDescription,
        imageUrl,
      },
      image: imageUrl,
    },
    dataUpdates: { imageUrl },
  };
}

async function executeStoryboard(_nodeData: Record<string, unknown>, input: Record<string, unknown>, refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  const storyInput = (input.story || input.storyInput) as StoryJSON;
  // Refs will be passed to storyboard generation via enriched story
  void refs;
  if (!storyInput?.scenes) throw new Error('Connect a Story Concept node first');

  const characterRef = input.character as { name: string; visualDescription: string; imageUrl?: string } | undefined;
  const characterRefs = characterRef ? [characterRef] : [];

  const storyboard = await generateStoryboard(storyInput, characterRefs);

  return {
    outputs: { storyboard },
    dataUpdates: {
      storyInput,
      storyboardOutput: storyboard,
    },
  };
}

async function executeFrameGenerator(nodeData: Record<string, unknown>, input: Record<string, unknown>, refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  const storyboardInput = input.storyboard as { scenes: Array<{ imagePrompt: string }> } | undefined;
  const characterInput = input.character as { visualDescription?: string } | undefined;

  let imagePrompt = nodeData.imagePrompt as string;

  // Auto-fill from storyboard if prompt empty
  if (!imagePrompt && storyboardInput?.scenes?.length) {
    const sceneIndex = (nodeData.sceneIndex as number) || 0;
    const scene = storyboardInput.scenes[sceneIndex] || storyboardInput.scenes[0];
    imagePrompt = scene.imagePrompt;
  }

  if (!imagePrompt) throw new Error('Provide an image prompt or connect a Storyboard node');

  let style = nodeData.style as string || 'cinematic photorealistic, 8K, dramatic lighting';
  const aspectRatio = (nodeData.aspectRatio as '9:16' | '1:1' | '16:9') || '9:16';

  // Inject character description if available
  if (characterInput?.visualDescription) {
    imagePrompt = `${imagePrompt}. Character details: ${characterInput.visualDescription}`;
  }

  // Inject color grading + style references into the prompt
  const refCtx = buildRefContext(refs, 'color_grading', 'style');
  if (refCtx) style = `${style}${refCtx}`;

  let imageUrl: string;
  let localPath: string;
  let cdnUrl: string | undefined;
  // Gemini Imagen 4 > Freepik > DALL-E — imageService handles priority
  if (process.env.GEMINI_API_KEY) {
    const result = await generateSceneFrame(imagePrompt, style, aspectRatio);
    imageUrl = result.imageUrl;
    localPath = result.localPath;
  } else if (useFreepik()) {
    const result = await freepik.generateImage(imagePrompt, style, aspectRatio);
    imageUrl = result.imageUrl;
    localPath = result.localPath;
    cdnUrl = result.cdnUrl;
  } else {
    const result = await generateSceneFrame(imagePrompt, style, aspectRatio);
    imageUrl = result.imageUrl;
    localPath = result.localPath;
  }

  return {
    outputs: { image: imageUrl, imagePath: localPath, imageCdnUrl: cdnUrl },
    dataUpdates: {
      imageUrl,
      imagePrompt,
    },
  };
}

async function executeAnimation(nodeData: Record<string, unknown>, input: Record<string, unknown>, refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  const imageInput = input.image as string | undefined;
  const imageCdnUrl = input.imageCdnUrl as string | undefined;
  const sourceImageUrl = imageInput || (nodeData.sourceImageUrl as string);

  if (!sourceImageUrl) throw new Error('Connect a Frame Generator node to provide an image');

  // Storyboard auto-fill: if a storyboard scene is connected, read its decisions
  const storyboardScene = input.storyboardScene as Record<string, unknown> | undefined;

  // Priority: storyboard data > manual node data (agentic = storyboard decides, human overrides only if they want to)
  const sceneType = (storyboardScene?.sceneType || nodeData.sceneType || 'still_camera') as string;
  const motionPreset = (storyboardScene?.cameraPreset || nodeData.motionPreset || 'drift_up') as string;
  const actionPrompt = (storyboardScene?.actionPrompt || nodeData.actionPrompt) as string | undefined;
  const cameraAssist = (nodeData.cameraAssist) as string | undefined;
  const customMotionPrompt = (nodeData.customMotionPrompt) as string | undefined;

  // Audio-driven duration: if a voiceover duration is connected, use it instead of the static value.
  const voDuration = input.audioDuration as number | undefined;
  const storyboardClipDuration = input.clipDuration as number | undefined;
  const manualDuration = nodeData.durationSeconds as number || 5;

  // Priority: VO duration (most accurate) > storyboard-specified duration > manual fallback
  const durationSeconds = voDuration
    ? Math.ceil(voDuration) + 1
    : storyboardClipDuration || manualDuration;

  // Kling only accepts 5 or 10
  const klingDuration = durationSeconds <= 7 ? 5 : 10;

  console.log(`  [animation] Motion: ${motionPreset}, Duration: VO=${voDuration}s, storyboard=${storyboardClipDuration}s → ${durationSeconds}s (Kling: ${klingDuration}s)`);

  // Full cinematic motion vocabulary → Kling video generation prompts
  const motionPrompts: Record<string, string> = {
    // Camera movement
    static: 'completely locked-off static camera, zero movement, architectural precision, every pixel still — the stillness itself creates tension',
    handheld: 'subtle handheld camera micro-movements, natural breathing sway, documentary presence, slightly imperfect and human — not stabilized',
    handheld_walk: 'handheld following movement, gentle walking bounce, documentary following shot, natural pace, subject stays centered',

    // Dolly / track
    push_in: 'very slow dolly push toward subject, closing emotional distance, building intimacy, the camera is leaning in to listen',
    pull_out: 'slow reverse dolly pulling away from subject, revealing surrounding environment, isolation growing, context expanding',
    track_left: 'smooth lateral tracking shot moving left, steadicam glide, subject stays centered as background slides past',
    track_right: 'smooth lateral tracking shot moving right, steadicam glide, subject stays centered as background slides past',
    dolly_circle: 'slow 30-degree orbit around subject, subject stays centered, background rotates revealing new angles, deliberate and cinematic',

    // Pan / tilt
    pan_left: 'slow camera pan rotating left, scanning the environment, revealing new information entering frame from right',
    pan_right: 'slow camera pan rotating right, scanning the environment, revealing new information entering frame from left',
    tilt_up: 'slow tilt from ground level upward, feet to face, or street to sky, ascending reveal',
    tilt_down: 'slow tilt from above downward, sky to ground, face to hands, descending reveal settling into detail',
    whip_pan: 'fast whip pan with motion blur, sudden snap to new composition, energy transfer, jarring and intentional',

    // Zoom
    zoom_in_slow: 'extremely slow creeping zoom push, barely perceptible but building claustrophobia, the frame tightens imperceptibly',
    zoom_out_slow: 'extremely slow expanding zoom out, frame gradually breathes wider, relief and space opening',
    snap_zoom: 'sudden fast zoom punch-in to detail, aggressive and attention-grabbing, hitting a visual exclamation mark',
    rack_focus: 'depth of field shifts from foreground to background (or reverse), pulling attention between two planes, focus breathing',

    // Atmospheric
    drift_up: 'imperceptible dreamlike upward float, ethereal and weightless, as if the camera is exhaling upward',
    drift_down: 'imperceptible dreamlike downward settle, gentle gravity, sinking into the scene',
    drift_lateral: 'barely perceptible sideways glide, dreamlike lateral float, contemplative and still',
    pulse: 'subtle breathing zoom pulse, in-out-in-out very slowly, the frame is alive and present, like a heartbeat',
    ken_burns: 'classic Ken Burns slow pan across the frame combined with gentle zoom, documentary observational style, passage of time',

    // Crane / jib
    crane_up: 'smooth crane rising from eye level upward, revealing the full scope of the scene from above, ascending and expansive',
    crane_down: 'smooth crane descending from high angle down to eye level, arriving into the scene, intimate and grounding',
    boom_up_to_wide: 'starting tight on subject then rising and pulling wide in one fluid motion, intimate detail transitioning to epic scale',

    // UGC / phone
    selfie_handheld: 'front-camera selfie bounce, slight wide-angle distortion, one-arm hold with natural fatigue shake, authentic and unpolished',
    phone_propped: 'phone propped on a surface with very slight surface vibration, mostly stable with occasional micro-shift, authentic phone footage feel',
    screen_recording: 'static frame showing a phone or app screen, slight scroll movement, screen recording aesthetic',

    // AI-driven
    ai_cinematic: 'cinematic camera movement that best serves this scene, natural and motivated, let the AI choose the most emotionally appropriate motion',
    custom: '', // Will use customMotionPrompt
  };

  // Inject style refs into motion prompt
  const refCtx = buildRefContext(refs, 'style', 'color_grading');

  // Scene continuity: if the next scene's keyframe CDN URL is available, pass it as last_frame
  const nextSceneCdnUrl = input.nextSceneCdnUrl as string | undefined;

  // Build the video generation prompt based on scene type
  let finalPrompt: string;
  if (sceneType === 'action' && actionPrompt) {
    // Action scene: subject actually moves, things happen in the frame
    const cameraHint = cameraAssist && cameraAssist !== 'none' && motionPrompts[cameraAssist]
      ? `. Camera: ${motionPrompts[cameraAssist]}`
      : '';
    finalPrompt = `${actionPrompt}${cameraHint}`;
  } else if (sceneType === 'custom' && customMotionPrompt) {
    // Full custom prompt
    finalPrompt = customMotionPrompt;
  } else {
    // Still moment: camera motion over static subject
    finalPrompt = motionPrompts[motionPreset] || motionPrompts.drift_up;
  }
  if (refCtx) finalPrompt = `${finalPrompt}. ${refCtx}`;

  console.log(`  [animation] Scene: ${sceneType}, Prompt: ${finalPrompt.slice(0, 100)}...`);

  // Check for source assets assigned to this scene
  const sceneId = (storyboardScene?.sceneId || `scene_${nodeData.sceneIndex || 0}`) as string;
  const sourceAssets = getSourceAssetsForScene(sceneId);
  const replaceAsset = sourceAssets.find(a => a.compositeMode === 'replace');
  const overlayAssets = sourceAssets.filter(a => a.compositeMode !== 'replace');

  let videoUrl: string;

  if (replaceAsset) {
    // Source footage REPLACES AI generation entirely
    console.log(`  [animation] Using source footage: ${replaceAsset.label}`);
    const trimmed = await trimSourceClip(replaceAsset.filePath, 0, durationSeconds);
    videoUrl = `/assets/outputs/composited/${trimmed.split('/').pop()}`;
  } else if (sceneType === 'text_card') {
    // Brand card — text on black
    const text = (storyboardScene?.captionText || nodeData.label || '') as string;
    const logoAsset = sourceAssets.find(a => a.type === 'logo');
    const cardPath = await createBrandCard(text, logoAsset?.filePath, durationSeconds);
    videoUrl = `/assets/outputs/composited/${cardPath.split('/').pop()}`;
  } else {
    // Normal AI generation
    if (useFreepik() && imageCdnUrl) {
      const result = await freepik.imageToVideo(imageCdnUrl, finalPrompt, klingDuration, '9:16', nextSceneCdnUrl);
      videoUrl = result.videoUrl;
    } else {
      const localPath = sourceImageUrl.startsWith('/assets/outputs/')
        ? join(ASSETS_DIR, sourceImageUrl.replace('/assets/outputs/', ''))
        : sourceImageUrl;
      const result = await animateFrame(localPath, motionPreset, durationSeconds);
      videoUrl = result.videoUrl;
    }

    // Post-process: composite any overlay assets onto the AI-generated video
    if (overlayAssets.length > 0) {
      let currentVideoPath = videoUrl.startsWith('/assets/')
        ? join(ASSETS_DIR, '..', videoUrl.replace('/assets/', ''))
        : videoUrl;

      for (const overlay of overlayAssets) {
        console.log(`  [animation] Compositing overlay: ${overlay.label} (${overlay.compositeMode})`);
        currentVideoPath = await compositeAssetOntoVideo(currentVideoPath, overlay);
      }

      videoUrl = `/assets/outputs/composited/${currentVideoPath.split('/').pop()}`;
    }
  }

  return {
    outputs: { video: videoUrl, clipDuration: durationSeconds },
    dataUpdates: {
      sourceImageUrl,
      videoUrl,
      durationSeconds,
    },
  };
}

async function executeVoiceover(nodeData: Record<string, unknown>, input: Record<string, unknown>, _refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  // Auto-fill from storyboard scene data
  const storyboardScene = input.storyboardScene as Record<string, unknown> | undefined;

  const scriptInput = input.script as string | undefined;
  const script = (storyboardScene?.voiceoverText || scriptInput || nodeData.script) as string;

  if (!script || script.trim().length < 5) throw new Error('Provide a voiceover script (min 5 chars)');

  const narratorProfile = nodeData.narratorProfile as string || 'storyteller';

  const { audioUrl, durationSeconds } = await generateVoiceover(script, narratorProfile);

  return {
    outputs: { audio: audioUrl, duration: durationSeconds },
    dataUpdates: {
      audioUrl,
      durationSeconds,
      script,
    },
  };
}

async function executeSfx(nodeData: Record<string, unknown>, input: Record<string, unknown>, _refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  // Auto-fill from storyboard scene data (agentic — storyboard decides sound design)
  const storyboardScene = input.storyboardScene as Record<string, unknown> | undefined;

  const ambientPrompt = (storyboardScene?.ambientSound || nodeData.ambientPrompt || '') as string;
  const foleyPrompt = (storyboardScene?.foleySound || nodeData.foleyPrompt || '') as string;
  const transitionSound = (storyboardScene?.transitionSound || nodeData.transitionSound || '') as string;
  const prelapMs = nodeData.prelapMs as number || 300;

  // Get duration from connected VO or use 5s default
  const voDuration = input.audioDuration as number | undefined;
  const duration = voDuration ? Math.ceil(voDuration) : 5;

  // Combine ambient + foley into one scene audio
  const scenePrompt = [ambientPrompt, foleyPrompt].filter(Boolean).join('. ');
  if (!scenePrompt && !transitionSound) {
    throw new Error('Provide at least an ambient or foley description');
  }

  let audioUrl: string | undefined;
  let transitionAudioUrl: string | undefined;

  if (useFreepik()) {
    // Generate scene audio (ambient + foley combined)
    if (scenePrompt) {
      const result = await freepik.generateSoundEffect(scenePrompt, Math.min(duration, 22));
      audioUrl = result.audioUrl;
    }
    // Generate transition pre-lap audio separately (short, for J-cut)
    if (transitionSound) {
      const prelapDur = Math.max(0.5, Math.min(prelapMs / 1000 + 1, 5)); // generate a bit longer than the prelap
      const result = await freepik.generateSoundEffect(transitionSound, prelapDur);
      transitionAudioUrl = result.audioUrl;
    }
  } else {
    // No Freepik — SFX generation not available without API
    console.warn('[sfx] Freepik API required for SFX generation');
  }

  return {
    outputs: {
      sceneAudio: audioUrl,
      transitionAudio: transitionAudioUrl,
      prelapMs,
      duration,
    },
    dataUpdates: {
      audioUrl,
      transitionAudioUrl,
      durationSeconds: duration,
    },
  };
}

async function executeMusic(nodeData: Record<string, unknown>, _input: Record<string, unknown>, refs: ProjectReference[] = []): Promise<ExecuteNodeResponse> {
  const mood = nodeData.mood as string || 'emotional';

  if (useFreepik()) {
    // Inject audio refs into music generation if available
    void refs;
    const result = await freepik.generateMusic(mood, 60);
    return {
      outputs: { audio: result.audioUrl },
      dataUpdates: { audioUrl: result.audioUrl },
    };
  }

  // Fallback: placeholder music URLs
  const musicMap: Record<string, string> = {
    'emotional': '/assets/music/emotional_piano.mp3',
    'uplifting': '/assets/music/cinematic_build.mp3',
    'peaceful': '/assets/music/ambient_pad.mp3',
    'tense': '/assets/music/tension_strings.mp3',
    'epic': '/assets/music/epic_strings.mp3',
    'mysterious': '/assets/music/mystery_ambient.mp3',
  };
  const audioUrl = musicMap[mood] || musicMap['emotional'];
  return {
    outputs: { audio: audioUrl },
    dataUpdates: { audioUrl },
  };
}

async function executeCompile(nodeData: Record<string, unknown>, input: Record<string, unknown>): Promise<ExecuteNodeResponse> {
  const title = nodeData.title as string || 'My Story';

  // Gather video clips (may come as array or single)
  const videoInput = input.videos as string | string[];
  const frameUrls: string[] = Array.isArray(videoInput) ? videoInput : videoInput ? [videoInput] : [];

  // Audio inputs
  const voiceoverUrl = input.voiceover as string | undefined;
  const musicUrl = input.music as string | undefined;
  const storyboard = input.storyboard;

  // SFX: scene audio may come as single or array from multiple SFX nodes
  const sceneAudioInput = input.sceneAudio as string | string[] | undefined;
  const sceneAudioUrls: string[] = sceneAudioInput
    ? (Array.isArray(sceneAudioInput) ? sceneAudioInput : [sceneAudioInput])
    : [];

  if (frameUrls.length === 0) {
    throw new Error('No video clips — connect Animation or Frame Generator nodes');
  }

  const { videoUrl, jobId } = await compileVideo({
    title,
    frameUrls,
    voiceoverUrl,
    musicUrl,
    sceneAudioUrls,
    storyboard,
  });

  return {
    outputs: { video: videoUrl, storyboard },
    dataUpdates: {
      videoUrl,
      jobId,
    },
  };
}

async function executeExport(nodeData: Record<string, unknown>, input: Record<string, unknown>): Promise<ExecuteNodeResponse> {
  const videoInput = input.video as string;
  if (!videoInput) throw new Error('Connect a Compile node to get a video');

  const platform = nodeData.platform as string || 'instagram_reel';
  const caption = nodeData.caption as string;
  const hashtags = nodeData.hashtags as string[];

  // ── Caption burning (post-processing) ──────────────────────────────────────
  // Read captionConfig from the export node data
  const captionConfig = nodeData.captionConfig as CaptionConfig | undefined;

  // Read storyboard scene data from input (passed through from compile/storyboard)
  const storyboardInput = input.storyboard as {
    scenes?: Array<{
      captionText?: string;
      captionStyle?: 'word_reveal' | 'block_subtitle' | 'kinetic_text' | 'none';
      clipDuration: number;
    }>;
  } | undefined;

  let finalVideoUrl = videoInput;

  if (captionConfig && storyboardInput?.scenes && storyboardInput.scenes.length > 0) {
    // Check if any scene actually has caption text
    const hasCaptions = storyboardInput.scenes.some(
      (s) => s.captionText && s.captionText.trim().length > 0 && s.captionStyle !== 'none'
    );

    if (hasCaptions) {
      console.log(`  [export] Burning captions into video (style: ${captionConfig.style}, position: ${captionConfig.position})...`);
      try {
        finalVideoUrl = await burnCaptions(videoInput, storyboardInput.scenes, captionConfig);
        console.log(`  [export] Captioned video: ${finalVideoUrl}`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`  [export] Caption burn failed, exporting without captions: ${errMsg}`);
        // Fall back to uncaptioned video rather than failing the entire export
      }
    }
  }

  return {
    outputs: { exported: finalVideoUrl, caption, hashtags, platform },
    dataUpdates: { exportedUrl: finalVideoUrl },
  };
}

export default router;
