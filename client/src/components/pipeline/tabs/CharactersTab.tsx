import { useWorkflowStore } from '../../../stores/workflowStore';
import { useProjectStore } from '../../../stores/projectStore';
import { useTokens } from '../../../stores/themeStore';

export function CharactersTab() {
  const t = useTokens();
  const { nodes, executeNode } = useWorkflowStore();
  const { characterHistory, setActiveCharacterVersion } = useProjectStore();
  const charNodes = nodes.filter(n => n.type === 'character');

  if (charNodes.length === 0) {
    return (
      <div className="p-16 text-center">
        <p className={`text-sm ${t.textMuted}`}>No Character nodes in this workflow</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-lg font-semibold">Characters</h2>
      {charNodes.map(node => {
        const d = node.data;
        const name = d.characterName || 'Unnamed';
        const history = characterHistory[name] || [];

        return (
          <div key={node.id} className={`${t.bgCard} rounded-xl border ${t.border} overflow-hidden`}>
            {/* Main character card */}
            <div className="flex gap-5 p-5">
              {/* Image */}
              <div className="shrink-0">
                {d.imageUrl ? (
                  <img
                    src={d.imageUrl}
                    alt={name}
                    className="w-48 h-48 rounded-xl object-cover border border-neutral-700/50"
                  />
                ) : (
                  <div className={`w-48 h-48 rounded-xl ${t.bg} border ${t.borderSub} flex items-center justify-center`}>
                    <span className={`text-3xl opacity-20`}>👤</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusDot status={d.status} />
                    <h3 className="font-semibold">{name}</h3>
                  </div>
                  <button
                    onClick={() => executeNode(node.id)}
                    disabled={d.status === 'running'}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-600 text-white hover:bg-pink-500 disabled:opacity-40 transition-all"
                  >
                    {d.status === 'running' ? 'Generating...' : 'Generate Reference'}
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Description</p>
                    <p className={`text-xs ${t.textSub} line-clamp-4 whitespace-pre-wrap`}>{d.description || '—'}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-1`}>Visual Style</p>
                    <p className={`text-xs ${t.textSub}`}>{d.style || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Version History */}
            {history.length > 0 && (
              <div className={`border-t ${t.border} p-4`}>
                <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-3`}>
                  Iteration History ({history.length} versions)
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {history.map((ver) => (
                    <button
                      key={ver.id}
                      onClick={() => setActiveCharacterVersion(name, ver.id)}
                      className={`shrink-0 rounded-lg border-2 transition-all ${
                        ver.isActive
                          ? 'border-amber-500 ring-2 ring-amber-500/20'
                          : `${t.border} opacity-60 hover:opacity-100`
                      }`}
                    >
                      <img src={ver.imageUrl} alt={ver.notes || 'version'} className="w-20 h-20 rounded-md object-cover" />
                      <p className={`text-[9px] ${t.textMuted} px-1 py-0.5 truncate w-20`}>
                        {new Date(ver.timestamp).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
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
