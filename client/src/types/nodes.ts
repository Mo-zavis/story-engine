// ─── Node Types ──────────────────────────────────────────────────────────────

export type NodeType =
  | 'storyConcept'
  | 'character'
  | 'storyboard'
  | 'frameGenerator'
  | 'animation'
  | 'voiceover'
  | 'sfx'
  | 'music'
  | 'compile'
  | 'export';

export type NodeStatus = 'idle' | 'running' | 'done' | 'error';

export type PortType =
  | 'story_json'
  | 'character_ref'
  | 'storyboard_json'
  | 'image_data'
  | 'video_clip'
  | 'audio_data'
  | 'text'
  | 'any';

// ─── Port Data Payloads ───────────────────────────────────────────────────────

export interface StoryJSON {
  title: string;
  logline: string;
  genre: string;
  tone: string;
  characters: Character[];
  scenes: Scene[];
  script: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  visualDescription: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  imageUrl?: string;
}

export interface Scene {
  id: string;
  number: number;
  title: string;
  description: string;
  visualDescription: string;
  dialogue?: string;
  voiceoverText?: string;
  imageUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
}

export interface StoryboardJSON {
  sceneCount: number;
  scenes: StoryboardScene[];
}

export interface StoryboardScene {
  sceneId: string;
  sceneNumber: number;
  // Image generation
  imagePrompt: string;
  cameraAngle: string;
  mood: string;
  colorPalette: string;
  imageUrl?: string;
  // Video generation (agentic — decided by storyboard)
  sceneType: 'action' | 'still_moment' | 'text_card';
  actionPrompt: string;
  cameraPreset: string;
  // Transitions
  transitionToNext: string;
  transitionMotionHint: string;
  clipDuration: number;
  exitMotion: string;
  entryMotion: string;
  // Sound design
  ambientSound: string;
  foleySound: string;
  transitionSound: string;
  // Voiceover
  voiceoverText: string;
  narratorTone: string;
  // Caption
  captionText: string;
  captionStyle: 'word_reveal' | 'block_subtitle' | 'kinetic_text' | 'none';
}

// ─── Node Data ────────────────────────────────────────────────────────────────

export interface BaseNodeData {
  label: string;
  status: NodeStatus;
  jobId?: string;
  error?: string;
  outputs: Record<string, unknown>;
}

export interface StoryConceptNodeData extends BaseNodeData {
  type: 'storyConcept';
  concept: string;
  genre: string;
  tone: string;
  targetDuration: number; // seconds
  storyOutput?: StoryJSON;
}

export interface CharacterNodeData extends BaseNodeData {
  type: 'character';
  characterId?: string;
  characterName: string;
  description: string;
  style: string;
  imageUrl?: string;
}

export interface StoryboardNodeData extends BaseNodeData {
  type: 'storyboard';
  storyInput?: StoryJSON;
  storyboardOutput?: StoryboardJSON;
}

export interface FrameGeneratorNodeData extends BaseNodeData {
  type: 'frameGenerator';
  sceneId: string;
  imagePrompt: string;
  style: string;
  aspectRatio: '9:16' | '1:1' | '16:9';
  imageUrl?: string;
}

export interface AnimationNodeData extends BaseNodeData {
  type: 'animation';
  sceneIndex?: number;
  sceneType?: string;
  actionPrompt?: string;
  cameraAssist?: string;
  sourceImageUrl?: string;
  motionPreset: string;
  customMotionPrompt?: string;
  durationSeconds: number;
  videoUrl?: string;
}

export interface VoiceoverNodeData extends BaseNodeData {
  type: 'voiceover';
  sceneIndex?: number;
  script: string;
  narratorProfile: 'authority' | 'storyteller' | 'conversational' | 'documentary' | 'dramatic';
  audioUrl?: string;
  durationSeconds?: number;
}

export interface SfxNodeData extends BaseNodeData {
  type: 'sfx';
  sceneIndex?: number;
  sceneLabel: string;
  ambientPrompt: string;    // continuous background sound
  foleyPrompt: string;      // action-specific sounds
  transitionSound?: string; // pre-lap J-cut sound for next scene
  prelapMs: number;         // J-cut offset: how early the next scene's ambient starts (ms)
  audioUrl?: string;
  transitionAudioUrl?: string;
  durationSeconds?: number;
}

export interface MusicNodeData extends BaseNodeData {
  type: 'music';
  mood: string;
  genre: string;
  audioUrl?: string;
  durationSeconds?: number;
}

export interface CompileNodeData extends BaseNodeData {
  type: 'compile';
  title: string;
  scenes: string[]; // ordered scene IDs
  videoUrl?: string;
  thumbnailUrl?: string;
}

export type CaptionFont = 'Inter' | 'Oswald' | 'Bebas Neue' | 'JetBrains Mono' | 'custom';
export type CaptionPosition = 'bottom' | 'center' | 'top';
export type CaptionStyle = 'word_reveal' | 'block_subtitle' | 'kinetic_text';

export interface CaptionConfig {
  font: CaptionFont;
  customFontUrl?: string;
  position: CaptionPosition;
  style: CaptionStyle;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  bgOpacity?: number;
}

export interface ExportNodeData extends BaseNodeData {
  type: 'export';
  platform: 'instagram_reel' | 'instagram_story' | 'tiktok';
  caption?: string;
  hashtags?: string[];
  exportedUrl?: string;
  captionConfig?: CaptionConfig;
}

export type AnyNodeData =
  | StoryConceptNodeData
  | CharacterNodeData
  | StoryboardNodeData
  | FrameGeneratorNodeData
  | AnimationNodeData
  | VoiceoverNodeData
  | SfxNodeData
  | MusicNodeData
  | CompileNodeData
  | ExportNodeData;

// ─── Node definitions for the library ────────────────────────────────────────

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  category: 'story' | 'visual' | 'audio' | 'output';
  color: string;
  icon: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

export interface PortDefinition {
  id: string;
  label: string;
  type: PortType;
  required?: boolean;
}

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'storyConcept',
    label: 'Story Concept',
    description: 'AI generates a full story structure from your concept',
    category: 'story',
    color: '#7c3aed',
    icon: '✍️',
    inputs: [],
    outputs: [
      { id: 'story', label: 'Story', type: 'story_json' },
      { id: 'script', label: 'Script', type: 'text' },
    ],
  },
  {
    type: 'character',
    label: 'Character Design',
    description: 'Generate visual character reference with DALL-E',
    category: 'visual',
    color: '#db2777',
    icon: '🎭',
    inputs: [{ id: 'story', label: 'Story (optional)', type: 'story_json' }],
    outputs: [
      { id: 'character', label: 'Character Ref', type: 'character_ref' },
      { id: 'image', label: 'Reference Image', type: 'image_data' },
    ],
  },
  {
    type: 'storyboard',
    label: 'Storyboard',
    description: 'Break story into visual scene descriptions',
    category: 'story',
    color: '#0891b2',
    icon: '🎞️',
    inputs: [
      { id: 'story', label: 'Story', type: 'story_json', required: true },
      { id: 'character', label: 'Character Refs', type: 'character_ref' },
    ],
    outputs: [{ id: 'storyboard', label: 'Storyboard', type: 'storyboard_json' }],
  },
  {
    type: 'frameGenerator',
    label: 'Frame Generator',
    description: 'Generate keyframe images with DALL-E 3',
    category: 'visual',
    color: '#059669',
    icon: '🖼️',
    inputs: [
      { id: 'storyboard', label: 'Storyboard', type: 'storyboard_json' },
      { id: 'character', label: 'Character Ref', type: 'character_ref' },
    ],
    outputs: [{ id: 'image', label: 'Frame Image', type: 'image_data' }],
  },
  {
    type: 'animation',
    label: 'Animation',
    description: 'Animate frames — Remotion motion or AI video',
    category: 'visual',
    color: '#d97706',
    icon: '🎬',
    inputs: [{ id: 'image', label: 'Frame Image', type: 'image_data', required: true }],
    outputs: [{ id: 'video', label: 'Video Clip', type: 'video_clip' }],
  },
  {
    type: 'voiceover',
    label: 'Voiceover',
    description: 'ElevenLabs TTS narration',
    category: 'audio',
    color: '#2563eb',
    icon: '🎤',
    inputs: [{ id: 'script', label: 'Script', type: 'text' }],
    outputs: [
      { id: 'audio', label: 'Audio', type: 'audio_data' },
      { id: 'duration', label: 'Duration', type: 'any' },
    ],
  },
  {
    type: 'sfx',
    label: 'Scene Audio / SFX',
    description: 'Per-scene environmental sound: ambient bed, foley, J-cut transition audio',
    category: 'audio',
    color: '#0ea5e9',
    icon: '🔊',
    inputs: [
      { id: 'storyboard', label: 'Storyboard', type: 'storyboard_json' },
      { id: 'audioDuration', label: 'VO Duration', type: 'any' },
    ],
    outputs: [
      { id: 'sceneAudio', label: 'Scene Audio', type: 'audio_data' },
      { id: 'transitionAudio', label: 'Transition Pre-lap', type: 'audio_data' },
    ],
  },
  {
    type: 'music',
    label: 'Background Music',
    description: 'AI-generated background score matched to mood',
    category: 'audio',
    color: '#9333ea',
    icon: '🎵',
    inputs: [],
    outputs: [{ id: 'audio', label: 'Music Track', type: 'audio_data' }],
  },
  {
    type: 'compile',
    label: 'Compile Video',
    description: 'Compile all assets into final video via Remotion',
    category: 'output',
    color: '#dc2626',
    icon: '⚙️',
    inputs: [
      { id: 'videos', label: 'Video Clips', type: 'video_clip' },
      { id: 'voiceover', label: 'Voiceover', type: 'audio_data' },
      { id: 'sceneAudio', label: 'Scene Audio / SFX', type: 'audio_data' },
      { id: 'music', label: 'Music', type: 'audio_data' },
      { id: 'storyboard', label: 'Storyboard', type: 'storyboard_json' },
    ],
    outputs: [{ id: 'video', label: 'Final Video', type: 'video_clip' }],
  },
  {
    type: 'export',
    label: 'Export for Instagram',
    description: 'Format, burn captions, and export for Instagram Reels',
    category: 'output',
    color: '#16a34a',
    icon: '📱',
    inputs: [
      { id: 'video', label: 'Final Video', type: 'video_clip', required: true },
      { id: 'storyboard', label: 'Storyboard (for captions)', type: 'storyboard_json' },
    ],
    outputs: [{ id: 'exported', label: 'Ready to Post', type: 'any' }],
  },
];
