/**
 * Skill Service — loads production expertise markdown files and maps them
 * to pipeline stages. Skills get injected into Claude CLI calls as domain context.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '../../skills');

export type SkillTier = 'leadership' | 'consistency' | 'craft' | 'delivery';

export interface SkillManifest {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: SkillTier;
  stages: string[];      // which pipeline stages this skill feeds
  wordCount: number;
  filePath: string;
}

// ── Skill metadata ───────────────────────────────────────────────────────────

const SKILL_META: Record<string, { name: string; icon: string; description: string; tier: SkillTier; stages: string[] }> = {

  // ── Leadership (orchestration & vision) ─────────────────────────────────
  'director': {
    name: 'Director',
    icon: '🎬',
    description: 'Creative vision, stage orchestration, quality gates, conflict resolution — the brain that ensures every department serves one story',
    tier: 'leadership',
    stages: ['storyConcept', 'character', 'storyboard', 'frameGenerator', 'animation', 'voiceover', 'compile', 'export'],
  },
  'art-direction': {
    name: 'Art Director',
    icon: '🖼️',
    description: 'Visual treatment document, cross-department consistency, style evolution, visual hierarchy — bridges director vision to visual execution',
    tier: 'leadership',
    stages: ['storyConcept', 'storyboard', 'character', 'frameGenerator', 'animation', 'compile'],
  },
  'narrative-design': {
    name: 'Narrative Design',
    icon: '📐',
    description: 'Story architecture for 60s format, hook design, emotional mapping, scene economy, cliffhanger engineering',
    tier: 'leadership',
    stages: ['storyConcept', 'storyboard', 'voiceover'],
  },

  // ── Consistency (cross-generation guardrails) ───────────────────────────
  'continuity-supervisor': {
    name: 'Continuity Supervisor',
    icon: '📋',
    description: 'Temporal, spatial, character state, lighting, and action continuity — the memory that stateless AI models lack',
    tier: 'consistency',
    stages: ['storyboard', 'character', 'frameGenerator', 'animation', 'compile'],
  },
  'production-design': {
    name: 'Production Design',
    icon: '🏗️',
    description: 'World bible, location sheets, prop design, set dressing, environment anchoring — builds the physical world characters inhabit',
    tier: 'consistency',
    stages: ['storyConcept', 'storyboard', 'frameGenerator'],
  },
  'brand-integration': {
    name: 'Brand Integration',
    icon: '🔵',
    description: 'FSP & LSC visual identity, mandatory terminology, app UI specs, sports property rules, brand voice enforcement',
    tier: 'consistency',
    stages: ['storyConcept', 'storyboard', 'character', 'frameGenerator', 'voiceover', 'compile', 'export'],
  },
  'prompt-engineering': {
    name: 'Prompt Engineering',
    icon: '⚙️',
    description: 'AI generation quality control, anti-AI-look rules, prompt architecture, character consistency protocol, negative prompts',
    tier: 'consistency',
    stages: ['storyboard', 'character', 'frameGenerator', 'animation'],
  },

  // ── Craft (technical execution) ─────────────────────────────────────────
  'cinematography': {
    name: 'Cinematography',
    icon: '🎥',
    description: 'Shot composition, lens choices, camera movement, vertical framing, depth of field, lighting direction',
    tier: 'craft',
    stages: ['storyConcept', 'storyboard', 'frameGenerator', 'animation'],
  },
  'color-grading': {
    name: 'Color Grading',
    icon: '🎨',
    description: 'Color science, mood-to-palette mapping, shadow/midtone/highlight treatment, visual consistency',
    tier: 'craft',
    stages: ['storyboard', 'frameGenerator', 'animation', 'compile'],
  },
  'character-design': {
    name: 'Character Design',
    icon: '👤',
    description: 'Visual consistency protocol, costume continuity, identity anchors, multi-character rules',
    tier: 'craft',
    stages: ['storyConcept', 'storyboard', 'character', 'frameGenerator'],
  },
  'editing-transitions': {
    name: 'Editing & Transitions',
    icon: '✂️',
    description: 'Cut types, pacing rhythm, motion continuity, transition selection, scene-to-scene flow',
    tier: 'craft',
    stages: ['storyboard', 'animation', 'compile'],
  },
  'sound-design': {
    name: 'Sound Design',
    icon: '🔊',
    description: 'Ambient layers, foley, emotional punctuation, transition audio, mix relationships',
    tier: 'craft',
    stages: ['voiceover', 'music', 'compile'],
  },
  'voiceover-direction': {
    name: 'Voiceover Direction',
    icon: '🎙️',
    description: 'Pacing rules, word-to-duration mapping, narrator profiles, emphasis formatting, sync alignment',
    tier: 'craft',
    stages: ['storyConcept', 'voiceover'],
  },
  'caption-typography': {
    name: 'Caption & Typography',
    icon: '🔤',
    description: 'Safe zones, font selection, timing, word-by-word reveal, kinetic text, text cards',
    tier: 'craft',
    stages: ['compile', 'export'],
  },
  'final-mastering': {
    name: 'Final Mastering',
    icon: '🏁',
    description: 'Audio levels, color consistency check, export specs, quality checklist, delivery package',
    tier: 'craft',
    stages: ['compile', 'export'],
  },

  // ── Delivery (platform & distribution) ──────────────────────────────────
  'platform-optimization': {
    name: 'Platform Optimization',
    icon: '📱',
    description: 'Platform specs, engagement engineering, retention triggers, caption rules, thumbnail selection, publishing timing',
    tier: 'delivery',
    stages: ['compile', 'export'],
  },
};

// ── Stage-to-skill mapping ───────────────────────────────────────────────────
// Leadership + consistency skills are injected at every stage they cover.
// Craft skills handle technical execution. Delivery skills finalize output.

const STAGE_SKILLS: Record<string, string[]> = {
  storyConcept:   ['director', 'narrative-design', 'brand-integration', 'production-design', 'cinematography', 'color-grading', 'character-design', 'voiceover-direction'],
  character:      ['director', 'art-direction', 'continuity-supervisor', 'brand-integration', 'prompt-engineering', 'character-design', 'cinematography', 'color-grading'],
  // Core skills for storyboard — trimmed to 8 to fit Claude CLI context limits (was 14, caused timeouts)
  storyboard:     ['director', 'cinematography', 'color-grading', 'editing-transitions', 'sound-design', 'character-design', 'prompt-engineering', 'voiceover-direction'],
  frameGenerator: ['director', 'art-direction', 'continuity-supervisor', 'production-design', 'brand-integration', 'prompt-engineering', 'cinematography', 'color-grading', 'character-design'],
  animation:      ['director', 'art-direction', 'continuity-supervisor', 'prompt-engineering', 'cinematography', 'editing-transitions', 'color-grading'],
  voiceover:      ['director', 'narrative-design', 'brand-integration', 'voiceover-direction', 'sound-design'],
  music:          ['director', 'sound-design'],
  compile:        ['director', 'art-direction', 'continuity-supervisor', 'brand-integration', 'editing-transitions', 'caption-typography', 'final-mastering', 'sound-design', 'color-grading', 'platform-optimization'],
  export:         ['director', 'brand-integration', 'final-mastering', 'caption-typography', 'platform-optimization'],
};

// ── Skill cache ──────────────────────────────────────────────────────────────

const skillCache = new Map<string, string>();

export function loadSkill(skillId: string): string {
  if (skillCache.has(skillId)) return skillCache.get(skillId)!;

  const filePath = join(SKILLS_DIR, `${skillId}.md`);
  try {
    const content = readFileSync(filePath, 'utf-8');
    skillCache.set(skillId, content);
    return content;
  } catch {
    console.warn(`[skillService] Skill file not found: ${filePath}`);
    return '';
  }
}

export function getSkillsForStage(stage: string): string {
  const skillIds = STAGE_SKILLS[stage] || [];
  const parts: string[] = [];

  for (const id of skillIds) {
    const content = loadSkill(id);
    if (content) {
      parts.push(`\n=== SKILL: ${SKILL_META[id]?.name || id} ===\n${content}\n`);
    }
  }

  if (parts.length === 0) return '';

  return `\n\n=== PRODUCTION EXPERTISE (${parts.length} skills) ===\n` +
    `Use the following production knowledge to guide your output. These are professional standards, not suggestions.\n` +
    parts.join('\n') +
    `\n=== END PRODUCTION EXPERTISE ===\n\n`;
}

export function getAllSkillManifest(): SkillManifest[] {
  const result: SkillManifest[] = [];

  for (const [id, meta] of Object.entries(SKILL_META)) {
    const content = loadSkill(id);
    result.push({
      id,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      tier: meta.tier,
      stages: meta.stages,
      wordCount: content ? content.split(/\s+/).length : 0,
      filePath: join(SKILLS_DIR, `${id}.md`),
    });
  }

  return result;
}

export function getStageSkillMap(): Record<string, string[]> {
  return STAGE_SKILLS;
}
