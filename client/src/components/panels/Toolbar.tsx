import { useState } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { api } from '../../lib/api';
import { FSP_UNDERDOG_TEMPLATE } from '../../templates/fsp-underdog';

interface WorkflowItem {
  id: string;
  name: string;
  updatedAt: string;
}

export function Toolbar() {
  const {
    workflowName,
    workflowId,
    isExecuting,
    setWorkflowName,
    saveWorkflow,
    loadWorkflow,
    loadTemplate,
    newWorkflow,
    executeAll,
    executeNodeSet,
    nodes,
  } = useWorkflowStore();

  const EP1_NODE_IDS = [
    'n_concept', 'n_kofi',
    'n_sb1',
    'n_f1a', 'n_f1b', 'n_f1c',
    'n_vo1a', 'n_vo1b', 'n_vo1c',
    'n_sfx1a', 'n_sfx1b', 'n_sfx1c',
    'n_a1a', 'n_a1b', 'n_a1c',
    'n_mu1',
    'n_co1', 'n_ex1',
  ];
  const hasEp1 = nodes.some((n) => n.id === 'n_concept');

  const [showWorkflows, setShowWorkflows] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveWorkflow();
    setSaving(false);
  };

  const handleShowWorkflows = async () => {
    const list = await api.listWorkflows();
    setWorkflows(list.workflows || []);
    setShowWorkflows(true);
  };

  const handleLoadWorkflow = async (id: string) => {
    await loadWorkflow(id);
    setShowWorkflows(false);
  };

  return (
    <div className="flex items-center justify-between px-4 h-12 bg-zinc-950 border-b border-zinc-800 shrink-0">
      {/* Left: Brand + name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <span className="text-sm font-bold text-white">Story Engine</span>
        </div>
        <div className="w-px h-4 bg-zinc-700" />
        {nameEditing ? (
          <input
            autoFocus
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={() => setNameEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setNameEditing(false)}
            className="bg-zinc-800 border border-zinc-600 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-48"
          />
        ) : (
          <button
            onClick={() => setNameEditing(true)}
            className="text-sm text-zinc-300 hover:text-white transition-colors"
          >
            {workflowName}
          </button>
        )}
        {workflowId && (
          <span className="text-[10px] text-zinc-600 font-mono">#{workflowId.slice(0, 8)}</span>
        )}
      </div>

      {/* Center: node count */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
        <span>{nodes.length} nodes</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={newWorkflow}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          New
        </button>

        <button
          onClick={handleShowWorkflows}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          Open
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        <button
          onClick={() => loadTemplate(FSP_UNDERDOG_TEMPLATE.nodes, FSP_UNDERDOG_TEMPLATE.edges, FSP_UNDERDOG_TEMPLATE.name)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-900/50 to-orange-900/50 text-amber-300 hover:from-amber-800/70 hover:to-orange-800/70 border border-amber-700/50 hover:border-amber-500 transition-all"
          title="Load the full FSP Underdog 5-episode series"
        >
          The Underdog
        </button>

        {hasEp1 && (
          <button
            onClick={() => executeNodeSet(EP1_NODE_IDS)}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 transition-all"
            title="Generate Episode 1 only"
          >
            Run Ep. 1
          </button>
        )}

        <div className="w-px h-4 bg-zinc-700" />

        <button
          onClick={executeAll}
          disabled={isExecuting || nodes.length === 0}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: isExecuting ? '#166534' : '#16a34a',
            color: 'white',
          }}
        >
          {isExecuting ? (
            <>
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running…
            </>
          ) : (
            <>▶ Run All</>
          )}
        </button>
      </div>

      {/* Workflow picker modal */}
      {showWorkflows && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowWorkflows(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold text-white mb-3">Open Workflow</div>
            {workflows.length === 0 ? (
              <div className="text-xs text-zinc-500 italic">No saved workflows yet</div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {workflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => handleLoadWorkflow(wf.id)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <div className="text-xs font-medium text-white">{wf.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {new Date(wf.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowWorkflows(false)}
              className="mt-3 w-full py-1.5 rounded-lg text-xs text-zinc-500 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
