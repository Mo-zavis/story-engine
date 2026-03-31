import Anthropic from '@anthropic-ai/sdk';
import { StoryJSON } from '../types.js';
import { runClaude, runClaudeWithSkills, extractJson, isClaudeCliAvailable } from './claudeCliService.js';

// ── SDK client (lazy, only if API key exists) ────────────────────────────────
let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

// ── Determine which backend to use ───────────────────────────────────────────
function useCliMode(): boolean {
  // Prefer CLI (uses subscription, no API key needed)
  // Fall back to SDK if CLI not installed
  if (isClaudeCliAvailable()) return true;
  if (getAnthropic()) return false;
  throw new Error('Neither Claude CLI nor ANTHROPIC_API_KEY is available. Install Claude CLI or set ANTHROPIC_API_KEY.');
}

// ── Story Concept ────────────────────────────────────────────────────────────

export async function generateStoryConcept(
  concept: string,
  genre: string,
  tone: string,
  targetDurationSeconds: number
): Promise<StoryJSON> {
  const sceneCount = Math.max(3, Math.ceil(targetDurationSeconds / 8));

  const prompt = `You are a master storyteller and screenwriter specializing in short-form vertical video for Instagram Reels.

Create a complete story structure for this concept:
**Concept:** ${concept}
**Genre:** ${genre}
**Tone:** ${tone}
**Target Duration:** ${targetDurationSeconds} seconds (~${sceneCount} scenes)

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "title": "Compelling title",
  "logline": "One sentence that captures the essence of the story",
  "genre": "${genre}",
  "tone": "${tone}",
  "characters": [
    {
      "id": "char_1",
      "name": "Character name",
      "description": "Who they are, their arc",
      "visualDescription": "Physical appearance, clothing, distinctive features for image generation",
      "role": "protagonist"
    }
  ],
  "scenes": [
    {
      "id": "scene_1",
      "number": 1,
      "title": "Scene title",
      "description": "What happens in this scene",
      "visualDescription": "Detailed visual description for image generation: setting, action, mood, lighting",
      "dialogue": "Optional spoken line",
      "voiceoverText": "Narration for this scene (20-30 words max for ${Math.ceil(targetDurationSeconds / sceneCount)}s)",
      "durationSeconds": ${Math.ceil(targetDurationSeconds / sceneCount)}
    }
  ],
  "script": "Full narration script for the entire video"
}

Make the story emotionally compelling, visually dynamic, and perfectly suited for vertical mobile video. Each scene should have a strong visual hook.`;

  if (useCliMode()) {
    console.log('  [storyService] Using Claude CLI for story concept...');
    const result = await runClaudeWithSkills(prompt, 'storyConcept', { timeout: 480_000 });
    if (!result.success) throw new Error(`Claude CLI failed: ${result.error}`);
    const story = extractJson<StoryJSON>(result.output);
    if (!story || !story.title || !story.scenes) throw new Error('Invalid story JSON from Claude CLI');
    return story;
  }

  // SDK fallback
  const response = await getAnthropic()!.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in story response');
  const story = JSON.parse(jsonMatch[0]) as StoryJSON;
  if (!story.title || !story.scenes || !story.characters) throw new Error('Invalid story structure');
  return story;
}

// ── Storyboard ───────────────────────────────────────────────────────────────

export async function generateStoryboard(
  story: StoryJSON,
  characterRefs: Array<{ name: string; imageUrl?: string; visualDescription: string }>
): Promise<{
  sceneCount: number;
  scenes: Array<{
    sceneId: string;
    sceneNumber: number;
    // Image generation
    imagePrompt: string;
    cameraAngle: string;
    mood: string;
    colorPalette: string;
    // Video generation (agentic — no human selection needed)
    sceneType: 'action' | 'still_moment' | 'text_card';
    actionPrompt: string;
    cameraPreset: string;
    // Transitions
    transitionToNext: string;
    transitionMotionHint: string;
    clipDuration: number;
    exitMotion: string;
    entryMotion: string;
    // Sound design (agentic — feeds SFX node automatically)
    ambientSound: string;
    foleySound: string;
    transitionSound: string;
    // Voiceover
    voiceoverText: string;
    narratorTone: string;
    // Caption
    captionText: string;
    captionStyle: 'word_reveal' | 'block_subtitle' | 'kinetic_text' | 'none';
  }>;
}> {
  const charContext = characterRefs.map((c) => `- ${c.name}: ${c.visualDescription}`).join('\n');

  const prompt = `You are the DIRECTOR of a 60-second Instagram Reel short film. You make ALL creative decisions — no one downstream should need to make choices. Your storyboard is the COMPLETE production plan.

Story: "${story.title}"
Logline: ${story.logline}
Genre: ${story.genre} | Tone: ${story.tone}

Characters:
${charContext}

Scenes:
${story.scenes.map((s, i) => `Scene ${i + 1}: ${s.description}\nVisual: ${s.visualDescription}\nDialogue/VO: ${s.voiceoverText || 'none'}`).join('\n\n')}

For EACH scene you must decide EVERYTHING. The downstream pipeline is fully automated — it reads your storyboard and executes without human intervention.

DECISIONS PER SCENE:

1. **sceneType** — Is this an ACTION scene (subject physically moves, things happen), a STILL MOMENT (subject barely moves, camera does the work), or a TEXT CARD (black screen with text)?

2. **imagePrompt** — The opening keyframe. Be extremely specific: shot type (ECU/CU/MCU/MS/WS), lens (24mm/50mm/85mm), depth of field, lighting sources with color temperature, 9:16 vertical composition, character description including exact clothing and expression.

3. **actionPrompt** — For ACTION scenes: describe what PHYSICALLY HAPPENS in the video. "Man swings racket and misses ball, ball bounces off floor, he laughs." For STILL MOMENT scenes: describe subtle movement — "breathing, eyes tracking phone screen, slight head tilt." For TEXT CARD: leave empty.

4. **cameraPreset** — Camera motion: static, handheld, push_in, pull_out, track_left, track_right, pan_left, pan_right, tilt_up, tilt_down, dolly_circle, crane_up, crane_down, drift_up, drift_lateral, pulse, ken_burns, zoom_in_slow, zoom_out_slow, snap_zoom, whip_pan, selfie_handheld, phone_propped.

5. **clipDuration** — VARY: hook=3-4s, rising=5-7s, climax=7-10s, resolution=5-6s. NEVER uniform.

6. **transitionToNext** — match_cut, dissolve, j_cut, l_cut, hard_cut, smash_cut. Exit/entry motion must be compatible.

7. **ambientSound** — Continuous background for this scene: "distant Brixton night traffic, faint fridge hum" or "squash court fluorescent buzz, echoed space."
8. **foleySound** — Action-specific sounds: "racket whoosh, ball hitting tin, shoe squeak on court."
9. **transitionSound** — The NEXT scene's ambient that bleeds in 300ms before the visual cut (J-cut pre-lap).

10. **voiceoverText** — The exact narration for this scene. Match word count to clipDuration (~3 words/second). Leave empty for silent scenes.
11. **narratorTone** — How the VO is delivered: "whispered intimate", "matter-of-fact confession", "building disbelief", "staccato rhythmic", "slow measured weight."

12. **captionText** — What text appears on screen (may differ from VO — can be a summary or key phrase). Leave empty for no captions.
13. **captionStyle** — word_reveal (each word appears as spoken), block_subtitle (full phrase bar), kinetic_text (animated impact), or none.

Return ONLY valid JSON:
{
  "sceneCount": ${story.scenes.length},
  "scenes": [
    {
      "sceneId": "scene_1",
      "sceneNumber": 1,
      "imagePrompt": "...",
      "cameraAngle": "ECU | CU | MCU | MS | MWS | WS",
      "mood": "...",
      "colorPalette": "shadow-color + midtone + highlight",
      "sceneType": "action | still_moment | text_card",
      "actionPrompt": "what physically happens in the video",
      "cameraPreset": "one of the camera presets listed above",
      "transitionToNext": "match_cut | dissolve | j_cut | l_cut | hard_cut | smash_cut",
      "transitionMotionHint": "visual/audio bridge to next scene",
      "clipDuration": 5,
      "exitMotion": "camera at end of clip",
      "entryMotion": "camera at start of clip",
      "ambientSound": "continuous background sound",
      "foleySound": "action-specific sounds",
      "transitionSound": "next scene ambient pre-lap",
      "voiceoverText": "exact narration words",
      "narratorTone": "delivery direction",
      "captionText": "on-screen text or empty",
      "captionStyle": "word_reveal | block_subtitle | kinetic_text | none"
    }
  ]
}`;

  if (useCliMode()) {
    console.log('  [storyService] Using Claude CLI for storyboard...');
    const result = await runClaudeWithSkills(prompt, 'storyboard', { timeout: 480_000 });
    if (!result.success) throw new Error(`Claude CLI failed: ${result.error}`);
    const sb = extractJson<Awaited<ReturnType<typeof generateStoryboard>>>(result.output);
    if (!sb || !sb.scenes) throw new Error('Invalid storyboard JSON from Claude CLI');
    return sb;
  }

  // SDK fallback
  const response = await getAnthropic()!.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in storyboard response');
  return JSON.parse(jsonMatch[0]);
}

// ── Voiceover Script (no LLM needed) ────────────────────────────────────────

export async function generateVoiceoverScript(story: StoryJSON): Promise<string> {
  return story.script || story.scenes.map((s) => s.voiceoverText || s.description).join(' ');
}
