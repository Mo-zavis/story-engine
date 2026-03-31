import { useWorkflowStore } from '../../../stores/workflowStore';
import { useTokens } from '../../../stores/themeStore';

const TRANSITION_STYLES: Record<string, { label: string; icon: string; color: string }> = {
  hard_cut: { label: 'HARD CUT', icon: '|', color: 'bg-neutral-600 text-neutral-300' },
  match_cut: { label: 'MATCH CUT', icon: '⟷', color: 'bg-purple-600/40 text-purple-300 border-purple-500/40' },
  dissolve: { label: 'DISSOLVE', icon: '◐', color: 'bg-blue-600/40 text-blue-300 border-blue-500/40' },
  j_cut: { label: 'J-CUT', icon: '⌐', color: 'bg-cyan-600/40 text-cyan-300 border-cyan-500/40' },
  l_cut: { label: 'L-CUT', icon: '⌐', color: 'bg-teal-600/40 text-teal-300 border-teal-500/40' },
  smash_cut: { label: 'SMASH CUT', icon: '⚡', color: 'bg-red-600/40 text-red-300 border-red-500/40' },
};

export function ClipsTab() {
  const t = useTokens();
  const { nodes, edges, executeNode } = useWorkflowStore();
  const animNodes = nodes.filter(n => n.type === 'animation');

  // Try to get transition data from connected storyboard nodes
  const sbNodes = nodes.filter(n => n.type === 'storyboard');
  const storyboardScenes = sbNodes.flatMap(n => n.data.storyboardOutput?.scenes || []);

  if (animNodes.length === 0) {
    return <div className="p-16 text-center"><p className={`text-sm ${t.textMuted}`}>No Animation nodes</p></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Clips — Animated Video Segments</h2>
        <p className={`text-xs ${t.textMuted}`}>{animNodes.filter(n => n.data.status === 'done').length}/{animNodes.length} rendered</p>
      </div>

      {/* Vertical timeline layout */}
      <div className="space-y-0">
        {animNodes.map((node, i) => {
          const d = node.data;
          const scene = storyboardScenes[i];
          const transition = scene?.transitionToNext;
          const transitionInfo = transition ? TRANSITION_STYLES[transition] : null;
          const isLast = i === animNodes.length - 1;

          return (
            <div key={node.id}>
              {/* Clip card */}
              <div className={`${t.bgCard} rounded-xl border ${t.border} overflow-hidden`}>
                <div className="flex flex-col md:flex-row">
                  {/* Video/Image preview */}
                  <div className="md:w-48 shrink-0 bg-black">
                    {d.videoUrl ? (
                      <video src={d.videoUrl} controls className="w-full aspect-[9/16] max-h-[320px] object-contain" />
                    ) : d.sourceImageUrl ? (
                      <img src={d.sourceImageUrl} alt="" className="w-full aspect-[9/16] max-h-[320px] object-contain opacity-40" />
                    ) : (
                      <div className="w-full aspect-[9/16] max-h-[200px] flex items-center justify-center">
                        <span className="text-2xl opacity-10">🎥</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.accentBg} ${t.accent}`}>Clip {i + 1}</span>
                        <StatusDot status={d.status} />
                        <p className="text-xs font-medium truncate">{d.label}</p>
                      </div>
                      <button
                        onClick={() => executeNode(node.id)}
                        disabled={d.status === 'running'}
                        className="px-3 py-1 rounded-lg text-[10px] font-medium bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-40"
                      >
                        {d.status === 'running' ? 'Rendering...' : d.videoUrl ? 'Re-render' : 'Render'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className={`text-[9px] ${t.textMuted} uppercase`}>Motion</p>
                        <p className={`text-xs ${t.textSub}`}>{d.motionPreset}</p>
                      </div>
                      <div>
                        <p className={`text-[9px] ${t.textMuted} uppercase`}>Duration</p>
                        <p className={`text-xs ${t.textSub}`}>{scene?.clipDuration || d.durationSeconds || 5}s</p>
                      </div>
                    </div>

                    {/* Entry/exit motion from storyboard */}
                    {scene?.entryMotion && (
                      <div className="mb-1">
                        <p className={`text-[9px] ${t.textMuted} uppercase`}>Entry Motion</p>
                        <p className={`text-[10px] ${t.textSub} italic`}>{scene.entryMotion}</p>
                      </div>
                    )}
                    {scene?.exitMotion && (
                      <div>
                        <p className={`text-[9px] ${t.textMuted} uppercase`}>Exit Motion</p>
                        <p className={`text-[10px] ${t.textSub} italic`}>{scene.exitMotion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transition indicator between clips */}
              {!isLast && (
                <div className="flex items-center justify-center py-2">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    transitionInfo ? transitionInfo.color : 'bg-neutral-700/30 text-neutral-500 border-neutral-600/30'
                  }`}>
                    <span>{transitionInfo?.icon || '|'}</span>
                    <span>{transitionInfo?.label || 'HARD CUT'}</span>
                    {scene?.transitionMotionHint && (
                      <span className={`font-normal normal-case ${t.textMuted} ml-1`}>— {scene.transitionMotionHint.slice(0, 40)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'done' ? 'bg-emerald-400' : status === 'running' ? 'bg-yellow-400 animate-pulse' : status === 'error' ? 'bg-red-400' : 'bg-neutral-500';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}
