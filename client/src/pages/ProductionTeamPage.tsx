import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokens, useThemeStore } from '../stores/themeStore';

interface SkillManifest {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: 'leadership' | 'consistency' | 'craft' | 'delivery';
  stages: string[];
  wordCount: number;
}

const TIER_META: Record<string, { label: string; description: string; color: string; bgColor: string; borderColor: string }> = {
  leadership: {
    label: 'Leadership',
    description: 'Vision & orchestration — decides what gets made and how',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  consistency: {
    label: 'Consistency',
    description: 'Cross-generation guardrails — the memory AI models lack',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  craft: {
    label: 'Craft',
    description: 'Technical execution — the hands that build each element',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  delivery: {
    label: 'Delivery',
    description: 'Platform optimization — ensures content performs where it ships',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
};

const TIER_META_LIGHT: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  leadership: { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  consistency: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  craft: { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  delivery: { color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
};

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  storyConcept: { label: 'Story', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  character: { label: 'Character', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  storyboard: { label: 'Storyboard', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  frameGenerator: { label: 'Frames', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  animation: { label: 'Animation', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  voiceover: { label: 'Voiceover', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  music: { label: 'Music', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  compile: { label: 'Compile', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  export: { label: 'Export', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
};

/* ── Simple markdown renderer ───────────────────────────────────────────── */

function renderMarkdown(md: string, isDark: boolean): string {
  let html = md
    // Code blocks (```...```)
    .replace(/```([^`]*?)```/gs, (_m, code) =>
      `<pre class="rounded-lg p-4 text-xs leading-relaxed overflow-x-auto font-mono ${isDark ? 'bg-neutral-900 text-neutral-300' : 'bg-stone-100 text-stone-700'}">${escapeHtml(code.trim())}</pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, (_m, code) =>
      `<code class="px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-neutral-800 text-amber-300' : 'bg-stone-200 text-amber-700'}">${escapeHtml(code)}</code>`)
    // Headers
    .replace(/^### (.+)$/gm, (_m, t) =>
      `<h3 class="text-sm font-semibold mt-6 mb-2 ${isDark ? 'text-neutral-200' : 'text-stone-800'}">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_m, t) =>
      `<h2 class="text-base font-semibold mt-8 mb-3 pb-2 border-b ${isDark ? 'text-neutral-100 border-neutral-800' : 'text-stone-900 border-stone-200'}">${t}</h2>`)
    .replace(/^# (.+)$/gm, (_m, t) =>
      `<h1 class="text-lg font-bold mb-1 ${isDark ? 'text-neutral-50' : 'text-stone-900'}">${t}</h1>`)
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    // Tables
    .replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (_m, header, _sep, body) => {
      const thCells = header.split('|').filter((c: string) => c.trim()).map((c: string) =>
        `<th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-stone-500'}">${c.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) =>
          `<td class="px-3 py-2 text-xs ${isDark ? 'text-neutral-300' : 'text-stone-600'}">${c.trim()}</td>`).join('');
        return `<tr class="${isDark ? 'border-neutral-800' : 'border-stone-200'} border-t">${cells}</tr>`;
      }).join('');
      return `<div class="overflow-x-auto my-4"><table class="w-full text-left ${isDark ? 'border-neutral-800' : 'border-stone-200'} border rounded-lg overflow-hidden"><thead class="${isDark ? 'bg-neutral-900' : 'bg-stone-50'}"><tr>${thCells}</tr></thead><tbody>${rows}</tbody></table></div>`;
    })
    // Unordered lists
    .replace(/^- (.+)$/gm, (_m, item) =>
      `<li class="text-xs leading-relaxed ml-4 list-disc ${isDark ? 'text-neutral-300' : 'text-stone-600'}">${item}</li>`)
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, (_m, item) =>
      `<li class="text-xs leading-relaxed ml-4 list-decimal ${isDark ? 'text-neutral-300' : 'text-stone-600'}">${item}</li>`)
    // Checkboxes
    .replace(/^- \[ \] (.+)$/gm, (_m, item) =>
      `<li class="text-xs leading-relaxed ml-4 list-none flex items-start gap-2 ${isDark ? 'text-neutral-300' : 'text-stone-600'}"><span class="mt-0.5 w-3.5 h-3.5 rounded border ${isDark ? 'border-neutral-600' : 'border-stone-400'} inline-block shrink-0"></span>${item}</li>`)
    .replace(/^- \[x\] (.+)$/gm, (_m, item) =>
      `<li class="text-xs leading-relaxed ml-4 list-none flex items-start gap-2 ${isDark ? 'text-neutral-300' : 'text-stone-600'}"><span class="mt-0.5 w-3.5 h-3.5 rounded border bg-emerald-500 border-emerald-500 inline-block shrink-0"></span>${item}</li>`)
    // Paragraphs (lines that aren't already wrapped)
    .replace(/^(?!<[hludtp]|<pre|<div|<li|<code|<strong|<em)(.+)$/gm, (_m, line) => {
      if (!line.trim()) return '';
      return `<p class="text-xs leading-relaxed mb-2 ${isDark ? 'text-neutral-300' : 'text-stone-600'}">${line}</p>`;
    });

  return html;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export function ProductionTeamPage() {
  const t = useTokens();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillManifest[]>([]);
  const [stageMap, setStageMap] = useState<Record<string, string[]>>({});
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillContent, setSkillContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/skills')
      .then(r => r.json())
      .then(data => {
        const loaded = data.skills || [];
        setSkills(loaded);
        setStageMap(data.stageMap || {});
        // Auto-select first skill
        if (loaded.length > 0 && !selectedSkillId) {
          handleSelectSkill(loaded[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectSkill = async (id: string) => {
    setSelectedSkillId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/skills/${id}`);
      const data = await res.json();
      setSkillContent(data.content || '');
    } catch {
      setSkillContent('Failed to load skill content.');
    }
    setLoading(false);
  };

  // Group skills by tier
  const groupedSkills = useMemo(() => {
    const groups: Record<string, SkillManifest[]> = {
      leadership: [],
      consistency: [],
      craft: [],
      delivery: [],
    };
    for (const skill of skills) {
      const tier = skill.tier || 'craft';
      if (!groups[tier]) groups[tier] = [];
      groups[tier].push(skill);
    }
    return groups;
  }, [skills]);

  const selectedSkill = skills.find(s => s.id === selectedSkillId);
  const totalWords = skills.reduce((sum, s) => sum + s.wordCount, 0);

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`border-b ${t.border} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className={`text-xs ${t.textMuted} ${t.bgHover} px-2 py-1 rounded transition-colors`}>&larr; Back</button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">S</div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Production Team</h1>
            <p className={`text-xs ${t.textMuted}`}>
              {skills.length} skills &middot; {totalWords.toLocaleString()} words of expertise &middot; 4 tiers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/system-flow')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all"
          >
            System Flow
          </button>
          <button onClick={toggleTheme} className={`px-3 py-1.5 rounded-lg text-xs ${t.bgSub} ${t.border} border ${t.textSub} transition-colors`}>
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {/* Main layout: sidebar + content */}
      <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>

        {/* ── Left sidebar: skill file tree ──────────────────────────── */}
        <aside className={`w-72 shrink-0 border-r ${t.border} overflow-y-auto`}>
          <div className={`px-3 py-2 text-[10px] uppercase tracking-widest font-semibold ${t.textMuted} border-b ${t.border}`}>
            Skills
          </div>

          {(['leadership', 'consistency', 'craft', 'delivery'] as const).map(tier => {
            const tierSkills = groupedSkills[tier] || [];
            if (tierSkills.length === 0) return null;
            const meta = isDark ? TIER_META[tier] : { ...TIER_META[tier], ...TIER_META_LIGHT[tier] };

            return (
              <div key={tier}>
                {/* Tier header */}
                <div className={`px-3 py-2 flex items-center gap-2 border-b ${t.border}`}>
                  <span className={`text-[9px] uppercase tracking-widest font-bold ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className={`text-[9px] ${t.textMuted} hidden xl:inline`}>
                    &middot; {meta.description}
                  </span>
                </div>

                {/* Skill files */}
                {tierSkills.map(skill => {
                  const isSelected = selectedSkillId === skill.id;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleSelectSkill(skill.id)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors text-sm border-l-2 ${
                        isSelected
                          ? `${isDark ? 'bg-neutral-800/80' : 'bg-stone-100'} border-amber-500`
                          : `border-transparent ${t.bgHover}`
                      }`}
                    >
                      <span className="text-base leading-none">{skill.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-medium truncate ${isSelected ? (isDark ? 'text-neutral-100' : 'text-stone-900') : ''}`}>
                          {skill.name}
                        </div>
                        <div className={`text-[10px] ${t.textMuted} truncate`}>
                          {skill.id}.md &middot; {skill.wordCount.toLocaleString()} words
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </aside>

        {/* ── Right content: markdown viewer ─────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {selectedSkill ? (
            <>
              {/* File header bar */}
              <div className={`sticky top-0 z-10 px-6 py-3 border-b ${t.border} ${isDark ? 'bg-neutral-950/95' : 'bg-stone-50/95'} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{selectedSkill.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{selectedSkill.name}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                        isDark
                          ? `${TIER_META[selectedSkill.tier]?.bgColor} ${TIER_META[selectedSkill.tier]?.color}`
                          : `${TIER_META_LIGHT[selectedSkill.tier]?.bgColor} ${TIER_META_LIGHT[selectedSkill.tier]?.color}`
                      }`}>
                        {selectedSkill.tier}
                      </span>
                    </div>
                    <p className={`text-[11px] ${t.textMuted}`}>
                      {selectedSkill.id}.md &middot; {selectedSkill.wordCount.toLocaleString()} words &middot; {selectedSkill.stages.length} pipeline stages
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                  {selectedSkill.stages.map(stage => {
                    const info = STAGE_LABELS[stage];
                    return info ? (
                      <span key={stage} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${info.color}`}>
                        {info.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Skill description bar */}
              <div className={`px-6 py-3 border-b ${t.border} ${isDark ? 'bg-neutral-900/50' : 'bg-stone-50/50'}`}>
                <p className={`text-xs ${t.textSub} leading-relaxed`}>
                  {selectedSkill.description}
                </p>
              </div>

              {/* Markdown content */}
              <div className="px-6 py-6 max-w-4xl">
                {loading ? (
                  <div className={`text-xs ${t.textMuted} animate-pulse`}>Loading skill content...</div>
                ) : (
                  <div
                    className="skill-markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(skillContent, isDark) }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className={`text-sm ${t.textMuted}`}>Select a skill from the sidebar to view its content.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
