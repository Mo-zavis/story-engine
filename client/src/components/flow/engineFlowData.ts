import type { Node, Edge } from '@xyflow/react';

/* ================================================================== */
/*  STORY ENGINE — SYSTEM ARCHITECTURE FLOW                            */
/*  Clean left-to-right pipeline. No group clutter.                    */
/* ================================================================== */

// ─── Layout: 6 columns, 3 rows ──────────────────────────────────────
//
//  COL1         COL2          COL3         COL4          COL5         COL6
//  Input        Story Gen     Storyboard   Visual Gen    Compile      Export
//
//  ROW1 (main pipeline)
//  ROW2 (audio pipeline)
//  ROW3 (services + storage)

const X = [0, 340, 680, 1020, 1360, 1700]; // 6 columns, 340px apart
const Y = { main: 0, audio: 260, services: 540, storage: 540 };

/* ================================================================== */
/*  NODES                                                              */
/* ================================================================== */

export const engineNodes: Node[] = [

  // ─── ROW 1: Main visual pipeline (left → right) ───────────────

  {
    id: 'user-input',
    type: 'stage',
    position: { x: X[0], y: Y.main },
    data: {
      label: 'User Input',
      category: 'input',
      icon: '\u270D\uFE0F',
      tech: 'React UI @ :3421',
      description: 'Concept, genre, tone, target duration. Project references for style consistency.',
      details: ['Concept', 'Genre', 'Tone', 'Duration', 'Style refs'],
      hasInput: false,
    },
  },
  {
    id: 'story-concept',
    type: 'stage',
    position: { x: X[1], y: Y.main },
    data: {
      label: 'Story Concept',
      category: 'ai',
      icon: '\uD83D\uDCD6',
      tech: 'storyService.ts \u2192 Claude Opus 4.6',
      description: 'Generates StoryJSON: title, logline, characters[], scenes[], full narration script.',
      details: ['~8s/scene', 'JSON extraction', 'Ref injection'],
    },
  },
  {
    id: 'storyboard',
    type: 'stage',
    position: { x: X[2], y: Y.main },
    data: {
      label: 'Storyboard',
      category: 'ai',
      icon: '\uD83C\uDF9E',
      tech: 'storyService.ts \u2192 Claude Opus 4.6',
      description: 'Per-scene image prompts with camera angles, mood, color palettes, cinematography specs.',
      details: ['Camera angles', 'Color palettes', 'Mood tags'],
    },
  },
  {
    id: 'frame-gen',
    type: 'stage',
    position: { x: X[3], y: Y.main },
    data: {
      label: 'Frame Generator',
      category: 'visual',
      icon: '\uD83D\uDDBC',
      tech: 'freepikService.ts \u2192 Mystic',
      description: '2K keyframe images per scene. Injects character refs + color grading from project refs.',
      details: ['9:16', '2K res', 'CDN + local'],
    },
  },
  {
    id: 'animation',
    type: 'stage',
    position: { x: X[4], y: Y.main },
    data: {
      label: 'Animation',
      category: 'visual',
      icon: '\uD83C\uDFA5',
      tech: 'animationService.ts \u2192 Kling O1',
      description: '28 camera motions across 8 categories: dolly, track, pan, tilt, crane, zoom, atmospheric, UGC + custom prompt. Audio-driven duration.',
      details: ['Kling O1', 'FFmpeg fallback', 'VO-synced duration', '28 presets'],
    },
  },
  {
    id: 'compile',
    type: 'stage',
    position: { x: X[4], y: Y.main + 130 },
    data: {
      label: 'Video Compilation',
      category: 'compile',
      icon: '\uD83C\uDFAC',
      tech: 'compileService.ts \u2192 Remotion',
      description: 'Primary: Media Pipeline (Remotion @ :9004). Fallback: FFmpeg concat. Polls job status.',
      details: ['H.264 MP4', '9:16', '5min timeout'],
    },
  },
  {
    id: 'export',
    type: 'stage',
    position: { x: X[5], y: Y.main + 130 },
    data: {
      label: 'Platform Export',
      category: 'export',
      icon: '\uD83D\uDCE4',
      tech: 'execute.ts \u2192 metadata wrap',
      description: 'Platform-specific metadata: captions, hashtags, aspect ratio. Ready for social posting.',
      details: ['Reels', 'Stories', 'TikTok'],
    },
  },

  // ─── ROW 2: Audio pipeline + character ─────────────────────────

  {
    id: 'character-design',
    type: 'stage',
    position: { x: X[1], y: Y.audio },
    data: {
      label: 'Character Design',
      category: 'ai',
      icon: '\uD83D\uDC64',
      tech: 'freepikService.ts / imageService.ts',
      description: 'Reference portraits from story data. Version history tracked. Feeds into all frame generators.',
      details: ['Freepik Mystic', 'DALL-E fallback', 'Versioned'],
    },
  },
  {
    id: 'voiceover',
    type: 'stage',
    position: { x: X[2], y: Y.audio },
    data: {
      label: 'Voiceover',
      category: 'audio',
      icon: '\uD83C\uDF99',
      tech: 'voiceoverService.ts \u2192 ElevenLabs',
      description: '5 narrator profiles: authority, storyteller, conversational, documentary, dramatic.',
      details: ['multilingual_v2', '~150 wpm', 'MP3'],
    },
  },
  {
    id: 'music',
    type: 'stage',
    position: { x: X[3], y: Y.audio },
    data: {
      label: 'Background Music',
      category: 'audio',
      icon: '\uD83C\uDFB5',
      tech: 'freepikService.ts \u2192 /music-generation',
      description: '6 moods: emotional, uplifting, tense, epic, peaceful, mysterious. Static fallback library.',
      details: ['Up to 240s', 'WAV', 'Fallback tracks'],
    },
  },

  // ─── ROW 3: External services ──────────────────────────────────

  {
    id: 'svc-anthropic',
    type: 'service',
    position: { x: X[1] + 10, y: Y.services },
    data: {
      label: 'Anthropic API',
      category: 'ai',
      icon: '\uD83E\uDDE0',
      provider: 'Claude Opus 4.6',
      endpoints: ['messages.create()', '4096 tokens'],
      hasInput: false,
      hasOutput: false,
    },
  },
  {
    id: 'svc-freepik',
    type: 'service',
    position: { x: X[3] + 10, y: Y.services },
    data: {
      label: 'Freepik API',
      category: 'visual',
      icon: '\uD83C\uDFA8',
      provider: 'Mystic + Kling O1 + Music',
      endpoints: ['/mystic', '/kling-o1-std', '/music-gen'],
      hasInput: false,
      hasOutput: false,
    },
  },
  {
    id: 'svc-elevenlabs',
    type: 'service',
    position: { x: X[2] + 10, y: Y.services },
    data: {
      label: 'ElevenLabs',
      category: 'audio',
      icon: '\uD83C\uDF99',
      provider: 'TTS multilingual_v2',
      endpoints: ['5 voices', 'MP3 output'],
      hasInput: false,
      hasOutput: false,
    },
  },
  {
    id: 'svc-openai',
    type: 'service',
    position: { x: X[1] + 200, y: Y.services },
    data: {
      label: 'OpenAI (Fallback)',
      category: 'service',
      icon: '\uD83E\uDD16',
      provider: 'DALL-E 3 HD',
      endpoints: ['Images only', 'Fallback'],
      hasInput: false,
      hasOutput: false,
    },
  },
  {
    id: 'svc-mediapipe',
    type: 'service',
    position: { x: X[4] + 10, y: Y.services },
    data: {
      label: 'Media Pipeline',
      category: 'compile',
      icon: '\uD83C\uDFAC',
      provider: 'Remotion 4.x @ :9004',
      endpoints: ['/render-video', '/status/:id'],
      hasInput: false,
      hasOutput: false,
    },
  },

  // ─── Storage row ───────────────────────────────────────────────

  {
    id: 'store-sqlite',
    type: 'service',
    position: { x: X[0] + 10, y: Y.storage },
    data: {
      label: 'SQLite DB',
      category: 'storage',
      icon: '\uD83D\uDDC4',
      provider: 'better-sqlite3 / WAL',
      endpoints: ['workflows', 'jobs'],
      hasInput: false,
      hasOutput: false,
    },
  },
  {
    id: 'store-assets',
    type: 'service',
    position: { x: X[5] + 10, y: Y.storage },
    data: {
      label: 'Asset Storage',
      category: 'storage',
      icon: '\uD83D\uDCC1',
      provider: '/assets/outputs/',
      endpoints: ['frames/', 'animations/', 'voiceovers/', 'compiled/'],
      hasInput: false,
      hasOutput: false,
    },
  },

  // ─── Metric badges (top) ───────────────────────────────────────

  {
    id: 'm-nodes',
    type: 'metric',
    position: { x: X[1], y: -120 },
    data: { label: 'Node Types', value: '9', category: 'ai' },
    draggable: false,
  },
  {
    id: 'm-services',
    type: 'metric',
    position: { x: X[2], y: -120 },
    data: { label: 'External APIs', value: '5', category: 'service' },
    draggable: false,
  },
  {
    id: 'm-presets',
    type: 'metric',
    position: { x: X[3], y: -120 },
    data: { label: 'Motion Presets', value: '6', category: 'visual' },
    draggable: false,
  },
  {
    id: 'm-narrators',
    type: 'metric',
    position: { x: X[4], y: -120 },
    data: { label: 'Narrators', value: '5', category: 'audio' },
    draggable: false,
  },
  {
    id: 'm-ports',
    type: 'metric',
    position: { x: X[5], y: -120 },
    data: { label: 'Typed Ports', value: '8', category: 'compile' },
    draggable: false,
  },
];

/* ================================================================== */
/*  EDGES — clean, minimal connections                                 */
/* ================================================================== */

function e(source: string, target: string, color: string, width = 2, dashed = false): Edge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    animated: !dashed,
    style: {
      stroke: color,
      strokeWidth: width,
      ...(dashed ? { strokeDasharray: '6 4' } : {}),
    },
  };
}

export const engineEdges: Edge[] = [
  // ─── Main pipeline (thick, animated) ───────────────────────────
  e('user-input',    'story-concept',    '#6366f1'),
  e('story-concept', 'storyboard',       '#7c3aed'),
  e('storyboard',    'frame-gen',        '#0891b2'),
  e('frame-gen',     'animation',        '#059669'),
  e('animation',     'compile',          '#d97706'),
  e('compile',       'export',           '#dc2626'),

  // ─── Story feeds character + voiceover ─────────────────────────
  e('story-concept', 'character-design', '#7c3aed', 1.5),
  e('story-concept', 'voiceover',       '#7c3aed', 1.5),

  // ─── Character feeds into storyboard + frames ──────────────────
  e('character-design', 'storyboard',   '#db2777', 1.5),
  e('character-design', 'frame-gen',    '#db2777', 1.5),

  // ─── Audio into compile ────────────────────────────────────────
  e('voiceover',     'compile',          '#2563eb'),
  e('music',         'compile',          '#9333ea', 1.5),

  // ─── User input to character ───────────────────────────────────
  e('user-input',    'character-design', '#6366f1', 1.5),

  // ─── Service connections (dashed, subtle) ──────────────────────
  e('svc-anthropic', 'story-concept',   '#7c3aed40', 1, true),
  e('svc-anthropic', 'storyboard',      '#7c3aed40', 1, true),
  e('svc-freepik',   'frame-gen',       '#05966940', 1, true),
  e('svc-freepik',   'animation',       '#05966940', 1, true),
  e('svc-freepik',   'music',           '#9333ea40', 1, true),
  e('svc-elevenlabs','voiceover',       '#2563eb40', 1, true),
  e('svc-mediapipe', 'compile',         '#dc262640', 1, true),
];
