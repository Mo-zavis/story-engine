import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeErrorBanner } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { StoryboardNodeData } from '../../types/nodes';

export const StoryboardNode = memo(function StoryboardNode({ id, data, selected }: NodeProps) {
  const d = data as StoryboardNodeData;
  const { executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="story" style={{ top: '30%', background: '#7c3aed', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="target" position={Position.Left} id="character" style={{ top: '60%', background: '#db2777', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label="Storyboard"
        icon="🎞️"
        color="#0891b2"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={280}
      >
        {d.storyInput ? (
          <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/30 text-[10px] text-zinc-400">
            Story: <span className="text-cyan-300">{d.storyInput.title}</span>
            <div className="mt-1 text-zinc-500">{d.storyInput.scenes.length} scenes detected</div>
          </div>
        ) : (
          <div className="text-[10px] text-zinc-600 italic">Connect a Story Concept node to begin</div>
        )}

        {d.storyboardOutput && (
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {d.storyboardOutput.scenes.map((scene, i) => (
              <div key={scene.sceneId} className="p-2 rounded bg-zinc-800/60 border border-zinc-700/50">
                <div className="text-[10px] font-semibold text-cyan-300">Scene {i + 1}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">{scene.imagePrompt}</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] text-zinc-500">{scene.cameraAngle}</span>
                  <span className="text-[9px] text-zinc-500">•</span>
                  <span className="text-[9px] text-zinc-500">{scene.mood}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="storyboard" style={{ top: '50%', background: '#0891b2', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
