import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTokens, useThemeStore } from '../stores/themeStore';
import { flowNodeTypes } from '../components/flow/flowNodes';
import { engineNodes, engineEdges } from '../components/flow/engineFlowData';

/* ------------------------------------------------------------------ */
/*  Legend data                                                         */
/* ------------------------------------------------------------------ */

const LEGEND = [
  { label: 'User Input', color: '#6366f1' },
  { label: 'AI Generation', color: '#7c3aed' },
  { label: 'Visual Production', color: '#059669' },
  { label: 'Audio Production', color: '#2563eb' },
  { label: 'Compilation', color: '#dc2626' },
  { label: 'Export / Delivery', color: '#16a34a' },
  { label: 'External Service', color: '#d97706' },
  { label: 'Data Storage', color: '#64748b' },
  { label: 'Quality Gate', color: '#db2777' },
];

const EDGE_LEGEND = [
  { label: 'Data flow', style: 'solid', color: '#a1a1aa' },
  { label: 'Service call', style: 'dashed', color: '#52525b' },
  { label: 'Reference injection', style: 'dotted', color: '#6366f1' },
  { label: 'Storage write', style: 'dotted', color: '#64748b' },
];

/* ------------------------------------------------------------------ */
/*  Mini-map color mapping                                             */
/* ------------------------------------------------------------------ */

const categoryColorMap: Record<string, string> = {
  input: '#6366f1',
  ai: '#7c3aed',
  visual: '#059669',
  audio: '#2563eb',
  compile: '#dc2626',
  export: '#16a34a',
  service: '#d97706',
  storage: '#64748b',
  quality: '#db2777',
};

function miniMapColor(node: { data?: Record<string, unknown> }) {
  const cat = (node.data?.category as string) || '';
  return categoryColorMap[cat] || '#4b5563';
}

/* ------------------------------------------------------------------ */
/*  Inner flow (needs ReactFlowProvider)                               */
/* ------------------------------------------------------------------ */

function FlowCanvas() {
  const t = useTokens();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [nodes, , onNodesChange] = useNodesState(engineNodes);
  const [edges, , onEdgesChange] = useEdgesState(engineEdges);
  const [showLegend, setShowLegend] = useState(true);

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string; data?: Record<string, unknown> }) => {
    // Future: open detail panel for the clicked node
    console.log('Node clicked:', node.id, node.data);
  }, []);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${t.bg} ${t.text}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 h-12 ${t.bgSub} border-b ${t.border} shrink-0`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className={`text-xs ${t.textMuted} ${t.bgHover} px-2 py-1 rounded transition-all`}
          >
            &larr; Projects
          </button>
          <div className={`w-px h-4 ${t.border}`} />
          <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">F</div>
          <span className="text-sm font-medium">Story Engine &mdash; System Architecture</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/production-team')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            Team
          </button>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`px-3 py-1.5 rounded-lg text-xs ${t.textSub} ${t.bgHover} border ${t.border} transition-all`}
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
          <button
            onClick={toggleTheme}
            className={`px-2 py-1.5 rounded-lg text-xs ${t.textMuted} ${t.bgHover} transition-all`}
          >
            {theme === 'dark' ? '\u2600' : '\uD83C\uDF19'}
          </button>
        </div>
      </header>

      {/* Flow canvas */}
      <div className="flex-1 relative" style={{ background: '#0a0a0a' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={flowNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.15}
          maxZoom={1.5}
          defaultEdgeOptions={{ animated: false }}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={32}
            size={1}
            color="#1a1a1a"
          />
          <Controls
            style={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
            }}
          />
          <MiniMap
            style={{
              background: '#09090b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
            }}
            nodeColor={miniMapColor}
            maskColor="rgba(0,0,0,0.6)"
            pannable
            zoomable
          />

          {/* Title panel */}
          <Panel position="top-center">
            <div className="text-center mt-2">
              <div className="text-[10px] text-neutral-500 tracking-widest uppercase font-mono">FSP CMO</div>
              <div className="text-lg font-semibold text-neutral-200 -mt-0.5">Story Engine Pipeline Architecture</div>
              <div className="text-[10px] text-neutral-600 mt-0.5">
                Concept &rarr; AI Story &rarr; Storyboard &rarr; Frames &rarr; Animation &rarr; Audio &rarr; Compile &rarr; Export
              </div>
            </div>
          </Panel>

          {/* Legend panel */}
          {showLegend && (
            <Panel position="bottom-left">
              <div
                className="rounded-xl p-3 max-w-[260px]"
                style={{
                  background: 'rgba(14,14,14,0.92)',
                  border: '1px solid #27272a',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mb-2">Node Categories</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3">
                  {LEGEND.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[9px] text-neutral-400">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mb-2">Edge Types</div>
                <div className="flex flex-col gap-1.5">
                  {EDGE_LEGEND.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <svg width="28" height="4" className="shrink-0">
                        <line
                          x1="0" y1="2" x2="28" y2="2"
                          stroke={item.color}
                          strokeWidth="1.5"
                          strokeDasharray={item.style === 'dashed' ? '4 2' : item.style === 'dotted' ? '2 2' : 'none'}
                        />
                      </svg>
                      <span className="text-[9px] text-neutral-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          )}

          {/* Tech stack panel */}
          <Panel position="bottom-right">
            <div
              className="rounded-xl p-3 max-w-[200px]"
              style={{
                background: 'rgba(14,14,14,0.92)',
                border: '1px solid #27272a',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mb-2">Tech Stack</div>
              <div className="space-y-1">
                {[
                  { label: 'Frontend', value: 'React + XYFlow + Zustand' },
                  { label: 'Backend', value: 'Express + SQLite' },
                  { label: 'Video', value: 'Remotion 4.x + FFmpeg' },
                  { label: 'AI', value: 'Claude Opus 4.6' },
                  { label: 'Images', value: 'Freepik Mystic / DALL-E 3' },
                  { label: 'Video Gen', value: 'Freepik Kling O1' },
                  { label: 'TTS', value: 'ElevenLabs v2' },
                  { label: 'Music', value: 'Freepik Gen' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-2">
                    <span className="text-[8px] text-neutral-500">{row.label}</span>
                    <span className="text-[8px] text-neutral-400 font-mono text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-neutral-800">
                <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mb-1">Ports</div>
                <div className="flex justify-between gap-2">
                  <span className="text-[8px] text-neutral-500">UI</span>
                  <span className="text-[8px] text-amber-400 font-mono">:3421</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[8px] text-neutral-500">API</span>
                  <span className="text-[8px] text-amber-400 font-mono">:3420</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[8px] text-neutral-500">Media Pipeline</span>
                  <span className="text-[8px] text-amber-400 font-mono">:9004</span>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported page (wraps with provider)                                */
/* ------------------------------------------------------------------ */

export function SystemFlowPage() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
