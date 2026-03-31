import { useWorkflowStore } from '../../../stores/workflowStore';
import { useTokens } from '../../../stores/themeStore';

export function ShotsTab() {
  const t = useTokens();
  const { nodes, executeNode } = useWorkflowStore();
  const frameNodes = nodes.filter(n => n.type === 'frameGenerator');

  if (frameNodes.length === 0) {
    return <div className="p-16 text-center"><p className={`text-sm ${t.textMuted}`}>No Frame Generator nodes</p></div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Shots — Opening Frames</h2>
        <p className={`text-xs ${t.textMuted}`}>{frameNodes.filter(n => n.data.status === 'done').length}/{frameNodes.length} generated</p>
      </div>

      <div className="space-y-6">
        {frameNodes.map((node, i) => {
          const d = node.data;
          return (
            <div key={node.id} className={`${t.bgCard} rounded-xl border ${t.border} overflow-hidden`}>
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-72 shrink-0">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.label} className="w-full h-full min-h-[300px] object-cover" />
                  ) : (
                    <div className={`w-full min-h-[300px] ${t.bg} flex items-center justify-center`}>
                      <span className="text-3xl opacity-10">🖼</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${t.accent} w-7 h-7 rounded-full ${t.accentBg} flex items-center justify-center`}>
                        {i + 1}
                      </span>
                      <StatusDot status={d.status} />
                      <h3 className="font-medium text-sm">{d.label}</h3>
                    </div>
                    <button
                      onClick={() => executeNode(node.id)}
                      disabled={d.status === 'running'}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
                    >
                      {d.status === 'running' ? 'Generating...' : d.imageUrl ? 'Regenerate' : 'Generate'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Image Prompt</p>
                      <p className={`text-xs ${t.textSub} whitespace-pre-wrap max-h-40 overflow-y-auto`}>{d.imagePrompt || '—'}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Style</p>
                        <p className={`text-xs ${t.textSub}`}>{d.style?.slice(0, 80) || '—'}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Ratio</p>
                        <p className={`text-xs ${t.textSub}`}>{d.aspectRatio || '9:16'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
