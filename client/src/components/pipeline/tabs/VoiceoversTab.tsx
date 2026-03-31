import { useWorkflowStore } from '../../../stores/workflowStore';
import { useTokens } from '../../../stores/themeStore';

export function VoiceoversTab() {
  const t = useTokens();
  const { nodes, executeNode } = useWorkflowStore();
  const voNodes = nodes.filter(n => n.type === 'voiceover');
  const musicNodes = nodes.filter(n => n.type === 'music');

  if (voNodes.length === 0 && musicNodes.length === 0) {
    return <div className="p-16 text-center"><p className={`text-sm ${t.textMuted}`}>No Voiceover or Music nodes</p></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-lg font-semibold">Voiceovers & Music</h2>

      {/* Voiceovers */}
      {voNodes.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-sm font-semibold ${t.textSub}`}>Narration</h3>
          {voNodes.map(node => {
            const d = node.data;
            return (
              <div key={node.id} className={`${t.bgCard} rounded-xl border ${t.border} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusDot status={d.status} />
                    <h4 className="font-medium text-sm">{d.label}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.bg} ${t.textMuted} border ${t.borderSub}`}>
                      {d.narratorProfile}
                    </span>
                  </div>
                  <button
                    onClick={() => executeNode(node.id)}
                    disabled={d.status === 'running'}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40"
                  >
                    {d.status === 'running' ? 'Generating...' : 'Generate'}
                  </button>
                </div>

                <div className={`p-3 rounded-lg ${t.bg} border ${t.borderSub} mb-3`}>
                  <p className={`text-xs ${t.text} whitespace-pre-wrap italic`}>"{d.script || 'No script provided'}"</p>
                </div>

                {d.audioUrl && (
                  <audio controls src={d.audioUrl} className="w-full h-10" style={{ accentColor: '#3b82f6' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Music */}
      {musicNodes.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-sm font-semibold ${t.textSub}`}>Background Music</h3>
          {musicNodes.map(node => {
            const d = node.data;
            return (
              <div key={node.id} className={`${t.bgCard} rounded-xl border ${t.border} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusDot status={d.status} />
                    <h4 className="font-medium text-sm">{d.label}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.bg} ${t.textMuted} border ${t.borderSub}`}>
                      {d.mood} / {d.genre}
                    </span>
                  </div>
                  <button
                    onClick={() => executeNode(node.id)}
                    disabled={d.status === 'running'}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40"
                  >
                    {d.status === 'running' ? 'Generating...' : 'Generate'}
                  </button>
                </div>

                {d.audioUrl && (
                  <audio controls src={d.audioUrl} className="w-full h-10" style={{ accentColor: '#9333ea' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'done' ? 'bg-emerald-400' : status === 'running' ? 'bg-yellow-400 animate-pulse' : status === 'error' ? 'bg-red-400' : 'bg-neutral-500';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}
