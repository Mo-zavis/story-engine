import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../stores/workflowStore';
import { FSP_UNDERDOG_TEMPLATE } from '../../templates/fsp-underdog';
import { NodeType, NODE_DEFINITIONS } from '../../types/nodes';
import { StoryConceptNode } from '../nodes/StoryConceptNode';
import { CharacterNode } from '../nodes/CharacterNode';
import { StoryboardNode } from '../nodes/StoryboardNode';
import { FrameGeneratorNode } from '../nodes/FrameGeneratorNode';
import { AnimationNode } from '../nodes/AnimationNode';
import { VoiceoverNode } from '../nodes/VoiceoverNode';
import { MusicNode } from '../nodes/MusicNode';
import { CompileNode } from '../nodes/CompileNode';
import { ExportNode } from '../nodes/ExportNode';
import { SfxNode } from '../nodes/SfxNode';

const nodeTypes: NodeTypes = {
  storyConcept: StoryConceptNode,
  character: CharacterNode,
  storyboard: StoryboardNode,
  frameGenerator: FrameGeneratorNode,
  animation: AnimationNode,
  voiceover: VoiceoverNode,
  sfx: SfxNode,
  music: MusicNode,
  compile: CompileNode,
  export: ExportNode,
};

const colorByType: Record<string, string> = {
  storyConcept: '#7c3aed',
  character: '#db2777',
  storyboard: '#0891b2',
  frameGenerator: '#059669',
  animation: '#d97706',
  voiceover: '#2563eb',
  sfx: '#0ea5e9',
  music: '#9333ea',
  compile: '#dc2626',
  export: '#16a34a',
};

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, selectNode } = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('nodeType') as NodeType;
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(nodeType, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Double-click on canvas to add quick node menu
  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="flex-1 relative" style={{ background: '#0d0d0d' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onNodeClick={(_, node) => selectNode(node.id)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#3f3f46', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#7c3aed', strokeWidth: 2 }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#27272a"
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
          nodeColor={(node) => colorByType[node.type || ''] || '#4b5563'}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3">
            <div className="text-5xl opacity-20">🎬</div>
            <div className="text-sm text-zinc-600">Drag nodes from the library to begin</div>
            <div className="text-xs text-zinc-700">or double-click a node in the library</div>
          </div>
        </div>
      )}

      {/* Quick-start templates */}
      {nodes.length === 0 && (
        <QuickStartBar />
      )}
    </div>
  );
}

function QuickStartBar() {
  const { addNode, loadTemplate } = useWorkflowStore();

  const buildTemplate = (template: string) => {
    if (template === 'minimal') {
      setTimeout(() => addNode('storyConcept', { x: 100, y: 250 }), 0);
      setTimeout(() => addNode('voiceover', { x: 500, y: 250 }), 50);
      setTimeout(() => addNode('compile', { x: 900, y: 250 }), 100);
      setTimeout(() => addNode('export', { x: 1300, y: 250 }), 150);
    } else if (template === 'full') {
      setTimeout(() => addNode('storyConcept', { x: 80, y: 300 }), 0);
      setTimeout(() => addNode('character', { x: 80, y: 600 }), 50);
      setTimeout(() => addNode('storyboard', { x: 450, y: 300 }), 100);
      setTimeout(() => addNode('frameGenerator', { x: 800, y: 200 }), 150);
      setTimeout(() => addNode('animation', { x: 1150, y: 200 }), 200);
      setTimeout(() => addNode('voiceover', { x: 450, y: 600 }), 250);
      setTimeout(() => addNode('music', { x: 800, y: 550 }), 300);
      setTimeout(() => addNode('compile', { x: 1500, y: 350 }), 350);
      setTimeout(() => addNode('export', { x: 1850, y: 350 }), 400);
    }
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto">
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-zinc-600">Quick start:</span>
        <button
          onClick={() => buildTemplate('minimal')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-all"
        >
          Minimal Pipeline
        </button>
        <button
          onClick={() => buildTemplate('full')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-all"
        >
          Full Cinematic Pipeline
        </button>
      </div>
      <button
        onClick={() => loadTemplate(FSP_UNDERDOG_TEMPLATE.nodes, FSP_UNDERDOG_TEMPLATE.edges, FSP_UNDERDOG_TEMPLATE.name)}
        className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-900/60 to-orange-900/60 text-amber-300 hover:from-amber-800/70 hover:to-orange-800/70 border border-amber-700/50 hover:border-amber-600 transition-all tracking-wide"
      >
        FSP — The Underdog (5 Episodes)  Load Full Series
      </button>
    </div>
  );
}
