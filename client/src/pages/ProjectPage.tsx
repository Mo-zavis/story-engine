import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { useProjectStore } from '../stores/projectStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { useTokens, useThemeStore } from '../stores/themeStore';
import { NodeLibrary } from '../components/panels/NodeLibrary';
import { Canvas } from '../components/panels/Canvas';
import { ExecutionLog } from '../components/panels/ExecutionLog';
import { PipelineView } from '../components/pipeline/PipelineView';
import { ReferencesPanel } from '../components/pipeline/ReferencesPanel';

type ViewMode = 'nodes' | 'pipeline';

export function ProjectPage() {
  const t = useTokens();
  const { theme, toggleTheme } = useThemeStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, openProject } = useProjectStore();
  const { workflowName, isExecuting, executeAll, saveWorkflow, nodes } = useWorkflowStore();

  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [showRefs, setShowRefs] = useState(false);

  useEffect(() => {
    if (id) openProject(id);
  }, [id, openProject]);

  return (
    <ReactFlowProvider>
      <div className={`flex flex-col h-screen w-screen overflow-hidden ${t.bg} ${t.text} transition-colors duration-300`} style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Top toolbar */}
        <header className={`flex items-center justify-between px-4 h-12 ${t.bgSub} border-b ${t.border} shrink-0`}>
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className={`text-xs ${t.textMuted} ${t.bgHover} px-2 py-1 rounded transition-all`}
            >
              &larr; Projects
            </button>
            <div className={`w-px h-4 ${t.border}`} />
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold">S</div>
            <span className="text-sm font-medium">{currentProject?.name || workflowName}</span>
            <span className={`text-[10px] ${t.textMuted}`}>{nodes.length} nodes</span>
          </div>

          {/* Center: View toggle */}
          <div className={`flex items-center rounded-lg p-0.5 ${t.bg} border ${t.border}`}>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'pipeline'
                  ? `${t.accentBg} ${t.accent}`
                  : `${t.textMuted} ${t.bgHover}`
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('nodes')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'nodes'
                  ? `${t.accentBg} ${t.accent}`
                  : `${t.textMuted} ${t.bgHover}`
              }`}
            >
              Node Editor
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/system-flow')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-violet-300 hover:text-violet-200 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 transition-all"
            >
              System Flow
            </button>
            <button
              onClick={() => navigate('/production-team')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 transition-all"
            >
              Team
            </button>
            <button
              onClick={() => setShowRefs(true)}
              className={`px-3 py-1.5 rounded-lg text-xs ${t.textSub} ${t.bgHover} border ${t.border} transition-all`}
            >
              Refs
            </button>
            <button
              onClick={toggleTheme}
              className={`px-2 py-1.5 rounded-lg text-xs ${t.textMuted} ${t.bgHover} transition-all`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            <button
              onClick={() => saveWorkflow()}
              className={`px-3 py-1.5 rounded-lg text-xs ${t.textSub} ${t.bgHover} border ${t.border} transition-all`}
            >
              Save
            </button>
            <button
              onClick={executeAll}
              disabled={isExecuting || nodes.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-all"
            >
              {isExecuting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                'Run All'
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        {viewMode === 'nodes' ? (
          <div className="flex flex-1 min-h-0">
            <NodeLibrary />
            <div className="flex flex-col flex-1 min-w-0">
              <Canvas />
              <ExecutionLog />
            </div>
          </div>
        ) : (
          <PipelineView />
        )}

        {/* References slide-out */}
        <ReferencesPanel isOpen={showRefs} onClose={() => setShowRefs(false)} />
      </div>
    </ReactFlowProvider>
  );
}
