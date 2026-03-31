import { useWorkflowStore } from '../../../stores/workflowStore';
import { useTokens } from '../../../stores/themeStore';

export function StoryboardTab() {
  const t = useTokens();
  const { nodes, executeNode } = useWorkflowStore();
  const sbNodes = nodes.filter(n => n.type === 'storyboard');
  const frameNodes = nodes.filter(n => n.type === 'frameGenerator');

  if (sbNodes.length === 0 && frameNodes.length === 0) {
    return <div className="p-16 text-center"><p className={`text-sm ${t.textMuted}`}>No Storyboard nodes</p></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-lg font-semibold">Storyboard</h2>

      {sbNodes.map(node => {
        const d = node.data;
        const sbOutput = d.storyboardOutput;
        return (
          <div key={node.id} className="space-y-4">
            <div className={`${t.bgCard} rounded-xl border ${t.border} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={d.status} />
                  <h3 className="font-medium text-sm">{d.label}</h3>
                </div>
                <button
                  onClick={() => executeNode(node.id)}
                  disabled={d.status === 'running'}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40"
                >
                  {d.status === 'running' ? 'Generating...' : 'Generate Storyboard'}
                </button>
              </div>

              {sbOutput?.scenes && (
                <div className="space-y-4 mt-4">
                  {sbOutput.scenes.map((scene: Record<string, unknown>, i: number) => (
                    <div key={(scene.sceneId as string) || i} className={`p-4 rounded-lg border ${t.borderSub} ${t.bg}`}>
                      {/* Header: scene number + tags */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-bold ${t.accent} w-8 h-8 rounded-full ${t.accentBg} flex items-center justify-center`}>
                          {(scene.sceneNumber as number) || i + 1}
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          <Tag t={t} label={scene.sceneType as string} />
                          <Tag t={t} label={scene.cameraAngle as string} />
                          <Tag t={t} label={scene.cameraPreset as string} />
                          <Tag t={t} label={scene.mood as string} />
                          <Tag t={t} label={`${scene.clipDuration || '?'}s`} />
                        </div>
                      </div>

                      {/* Image prompt */}
                      <div className="mb-3">
                        <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-1`}>Frame Prompt</p>
                        <p className={`text-xs ${t.text} whitespace-pre-wrap leading-relaxed`}>{scene.imagePrompt as string}</p>
                      </div>

                      {/* Action prompt (if action scene) */}
                      {scene.actionPrompt && (
                        <div className="mb-2">
                          <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-0.5`}>Action (what happens)</p>
                          <p className={`text-xs ${t.accent} whitespace-pre-wrap`}>{scene.actionPrompt as string}</p>
                        </div>
                      )}

                      {/* Color grade */}
                      <div className="mb-3">
                        <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-1`}>Color Grade</p>
                        <p className={`text-[10px] ${t.textSub} leading-relaxed`}>{scene.colorPalette as string}</p>
                      </div>

                      {/* Motion + Transition */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-1`}>Entry Motion</p>
                          <p className={`text-[10px] ${t.textSub} leading-relaxed`}>{(scene.entryMotion as string) || '—'}</p>
                        </div>
                        <div>
                          <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-1`}>Exit Motion</p>
                          <p className={`text-[10px] ${t.textSub} leading-relaxed`}>{(scene.exitMotion as string) || '—'}</p>
                        </div>
                      </div>

                      {/* Transition to next */}
                      {scene.transitionToNext && (
                        <div className="mb-3">
                          <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-1`}>Transition to Next Scene</p>
                          <p className={`text-[10px] ${t.accent} font-medium`}>{scene.transitionToNext as string}</p>
                          {scene.transitionMotionHint && (
                            <p className={`text-[10px] ${t.textSub} mt-0.5 leading-relaxed`}>{scene.transitionMotionHint as string}</p>
                          )}
                        </div>
                      )}

                      {/* Sound design */}
                      {(scene.ambientSound || scene.foleySound || scene.transitionSound) && (
                        <div className="mb-3">
                          <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-1`}>Sound Design</p>
                          {scene.ambientSound && (
                            <p className={`text-[10px] ${t.textSub} mb-1 leading-relaxed`}><span className={`font-medium ${t.text}`}>Ambient:</span> {scene.ambientSound as string}</p>
                          )}
                          {scene.foleySound && (
                            <p className={`text-[10px] ${t.textSub} mb-1 leading-relaxed`}><span className={`font-medium ${t.text}`}>Foley:</span> {scene.foleySound as string}</p>
                          )}
                          {scene.transitionSound && (
                            <p className={`text-[10px] ${t.textSub} leading-relaxed`}><span className={`font-medium ${t.text}`}>J-Cut Pre-lap:</span> {scene.transitionSound as string}</p>
                          )}
                        </div>
                      )}

                      {/* Voiceover */}
                      {scene.voiceoverText && (
                        <div className="mb-2">
                          <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-0.5`}>Voiceover</p>
                          <p className={`text-[10px] ${t.text} italic`}>"{scene.voiceoverText as string}"</p>
                          {scene.narratorTone && <p className={`text-[9px] ${t.textMuted} mt-0.5`}>Tone: {scene.narratorTone as string}</p>}
                        </div>
                      )}

                      {/* Caption */}
                      {scene.captionText && (
                        <div>
                          <p className={`text-[9px] ${t.textMuted} uppercase tracking-wider mb-0.5`}>Caption ({scene.captionStyle || 'none'})</p>
                          <p className={`text-[10px] ${t.textSub}`}>{scene.captionText as string}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Also show frame generators grouped as visual storyboard */}
      {frameNodes.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold ${t.textSub} mb-4`}>Scene Frames</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameNodes.map(node => {
              const d = node.data;
              return (
                <div key={node.id} className={`${t.bgCard} rounded-xl border ${t.border} overflow-hidden`}>
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.label} className="w-full aspect-[9/16] object-cover" />
                  ) : (
                    <div className={`w-full aspect-[9/16] ${t.bg} flex items-center justify-center`}>
                      <span className="text-2xl opacity-10">🖼</span>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <StatusDot status={d.status} />
                        <p className="text-xs font-medium truncate">{d.label}</p>
                      </div>
                    </div>
                    <p className={`text-[10px] ${t.textMuted} line-clamp-3`}>{d.imagePrompt?.slice(0, 120)}...</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'done' ? 'bg-emerald-400' : status === 'running' ? 'bg-yellow-400 animate-pulse' : status === 'error' ? 'bg-red-400' : 'bg-neutral-500';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

function Tag({ t, label }: { t: ReturnType<typeof useTokens>; label?: string }) {
  if (!label) return null;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.bg} ${t.textMuted} border ${t.borderSub}`}>{label}</span>;
}
