import { useWorkflowStore } from '../../../stores/workflowStore';
import { useProjectStore, ProjectReference } from '../../../stores/projectStore';
import { useTokens } from '../../../stores/themeStore';

const REF_TYPE_META: Record<ProjectReference['type'], { label: string; icon: string }> = {
  color_grading: { label: 'Color Grading', icon: '🎨' },
  font: { label: 'Font / Typography', icon: '🔤' },
  style: { label: 'Style Reference', icon: '🖼' },
  character: { label: 'Character Ref', icon: '👤' },
  audio: { label: 'Audio / Music Ref', icon: '🎵' },
  other: { label: 'Other', icon: '📎' },
};

export function StoryTab() {
  const t = useTokens();
  const { nodes, executeNode } = useWorkflowStore();
  const { currentProject } = useProjectStore();
  const conceptNodes = nodes.filter(n => n.type === 'storyConcept');

  if (conceptNodes.length === 0) {
    return <Empty t={t} label="No Story Concept nodes in this workflow" />;
  }

  const refs = currentProject?.references || [];
  const refsByType = refs.reduce<Record<string, ProjectReference[]>>((acc, ref) => {
    (acc[ref.type] ||= []).push(ref);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold">Story</h2>
      {conceptNodes.map(node => {
        const d = node.data;
        return (
          <div key={node.id} className={`${t.bgCard} rounded-xl border ${t.border} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StatusDot status={d.status} />
                <h3 className="font-medium text-sm">{d.label}</h3>
              </div>
              <button
                onClick={() => executeNode(node.id)}
                disabled={d.status === 'running'}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 transition-all"
              >
                {d.status === 'running' ? 'Running...' : 'Generate'}
              </button>
            </div>

            <div className="space-y-3">
              <Field t={t} label="Concept" value={d.concept} multiline />
              <div className="grid grid-cols-3 gap-3">
                <Field t={t} label="Genre" value={d.genre} />
                <Field t={t} label="Tone" value={d.tone} />
                <Field t={t} label="Duration" value={`${d.targetDuration}s`} />
              </div>

              {d.storyOutput && (
                <div className={`mt-4 p-4 rounded-lg ${t.accentBg} border ${t.accentBorder}`}>
                  <p className={`text-xs font-semibold ${t.accent} mb-2`}>Generated Story</p>
                  <p className="text-sm font-medium mb-1">{d.storyOutput.title}</p>
                  <p className={`text-xs ${t.textSub}`}>{d.storyOutput.logline}</p>
                  <p className={`text-xs ${t.textMuted} mt-2`}>
                    {d.storyOutput.scenes?.length || 0} scenes, {d.storyOutput.characters?.length || 0} characters
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── References Section ── */}
      <div className="pt-2">
        <h2 className="text-lg font-semibold mb-4">References</h2>

        {refs.length === 0 ? (
          <div className={`${t.bgCard} rounded-xl border border-dashed ${t.borderSub} p-8 text-center`}>
            <p className={`text-sm ${t.textMuted}`}>No references added yet</p>
            <p className={`text-xs ${t.textMuted} mt-1`}>
              Use the <span className="font-medium">Refs</span> button in the toolbar to add color grading, style, character, and audio references
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(refsByType).map(([type, typeRefs]) => {
              const meta = REF_TYPE_META[type as ProjectReference['type']] || { label: type, icon: '📎' };
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">{meta.icon}</span>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">{meta.label}</h3>
                    <span className={`text-[10px] ${t.textMuted}`}>({typeRefs.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {typeRefs.map((ref) => {
                      const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(ref.url);
                      return (
                        <div key={ref.id} className={`${t.bgCard} rounded-lg border ${t.border} overflow-hidden`}>
                          {isImage && (
                            <img
                              src={ref.url}
                              alt={ref.label}
                              className="w-full h-36 object-cover border-b border-neutral-700/20"
                            />
                          )}
                          <div className="p-3">
                            <p className="text-xs font-medium">{ref.label}</p>
                            <p className={`text-[10px] ${t.textMuted} truncate mt-0.5`}>{ref.url}</p>
                            {ref.notes && (
                              <p className={`text-[10px] ${t.textSub} mt-1.5 italic leading-relaxed`}>{ref.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'done' ? 'bg-emerald-400' : status === 'running' ? 'bg-yellow-400 animate-pulse' : status === 'error' ? 'bg-red-400' : 'bg-neutral-500';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

function Field({ t, label, value, multiline }: { t: ReturnType<typeof useTokens>; label: string; value?: string; multiline?: boolean }) {
  return (
    <div>
      <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>{label}</p>
      <p className={`text-xs ${t.text} ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function Empty({ t, label }: { t: ReturnType<typeof useTokens>; label: string }) {
  return (
    <div className="p-16 text-center">
      <p className={`text-sm ${t.textMuted}`}>{label}</p>
    </div>
  );
}
