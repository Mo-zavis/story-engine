import { useWorkflowStore } from '../../../stores/workflowStore';
import { useTokens } from '../../../stores/themeStore';
import { CaptionPreview } from './CaptionPreview';

export function FinalVideoTab() {
  const t = useTokens();
  const { nodes, executeNode } = useWorkflowStore();
  const compileNodes = nodes.filter(n => n.type === 'compile');
  const exportNodes = nodes.filter(n => n.type === 'export');

  if (compileNodes.length === 0) {
    return <div className="p-16 text-center"><p className={`text-sm ${t.textMuted}`}>No Compile nodes</p></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-lg font-semibold">Final Video + Captions</h2>

      {compileNodes.map((node, i) => {
        const d = node.data;
        const exportNode = exportNodes[i];
        const ed = exportNode?.data;

        return (
          <div key={node.id} className={`${t.bgCard} rounded-xl border ${t.border} overflow-hidden`}>
            {/* Video */}
            <div className="flex flex-col md:flex-row">
              <div className="md:w-[360px] shrink-0 bg-black">
                {d.videoUrl ? (
                  <video src={d.videoUrl} controls className="w-full aspect-[9/16] max-h-[500px] object-contain" />
                ) : (
                  <div className="w-full aspect-[9/16] max-h-[500px] flex items-center justify-center">
                    <span className="text-4xl opacity-10">🎬</span>
                  </div>
                )}
              </div>

              <div className="flex-1 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot status={d.status} />
                    <h3 className="font-medium">{d.title || d.label}</h3>
                  </div>
                  <button
                    onClick={() => executeNode(node.id)}
                    disabled={d.status === 'running'}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-40"
                  >
                    {d.status === 'running' ? 'Compiling...' : d.videoUrl ? 'Recompile' : 'Compile'}
                  </button>
                </div>

                {/* Caption */}
                {ed && (
                  <div className="space-y-3">
                    <div>
                      <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Platform</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.accentBg} ${t.accent} border ${t.accentBorder}`}>
                        {ed.platform || 'instagram_reel'}
                      </span>
                    </div>
                    <div>
                      <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Caption</p>
                      <div className={`p-3 rounded-lg ${t.bg} border ${t.borderSub}`}>
                        <p className={`text-xs ${t.text} whitespace-pre-wrap`}>{ed.caption || 'No caption set'}</p>
                      </div>
                    </div>
                    {ed.hashtags && ed.hashtags.length > 0 && (
                      <div>
                        <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Hashtags</p>
                        <div className="flex flex-wrap gap-1">
                          {(ed.hashtags as string[]).map((tag: string) => (
                            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full ${t.bg} ${t.textSub} border ${t.borderSub}`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {d.videoUrl && (
                      <a
                        href={d.videoUrl}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-500 mt-2"
                      >
                        Download Video
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Caption Preview Section */}
            {exportNode && (
              <div className={`border-t ${t.border} p-5`}>
                <CaptionPreview
                  exportNodeId={exportNode.id}
                  captionText={ed?.caption || ''}
                  captionConfig={ed?.captionConfig}
                  thumbnailUrl={d.thumbnailUrl}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'done' ? 'bg-emerald-400' : status === 'running' ? 'bg-yellow-400 animate-pulse' : status === 'error' ? 'bg-red-400' : 'bg-neutral-500';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}
