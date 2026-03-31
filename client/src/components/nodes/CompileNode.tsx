import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeInput, NodePreviewVideo, NodeErrorBanner, NodeOutputBadge } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { CompileNodeData } from '../../types/nodes';

export const CompileNode = memo(function CompileNode({ id, data, selected }: NodeProps) {
  const d = data as CompileNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="videos" style={{ top: '20%', background: '#d97706', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="target" position={Position.Left} id="voiceover" style={{ top: '40%', background: '#2563eb', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="target" position={Position.Left} id="music" style={{ top: '60%', background: '#9333ea', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="target" position={Position.Left} id="storyboard" style={{ top: '80%', background: '#0891b2', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label="Compile Video"
        icon="⚙️"
        color="#dc2626"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={280}
      >
        <NodeField label="Video Title">
          <NodeInput
            value={d.title}
            onChange={(v) => updateNodeData(id, { title: v })}
            placeholder="My Compelling Story"
          />
        </NodeField>

        <div className="px-2 py-1.5 rounded bg-red-950/30 border border-red-800/30 text-[10px] text-zinc-400 space-y-0.5">
          <div className="flex justify-between">
            <span>Renderer</span>
            <span className="text-red-300">Remotion 4.x</span>
          </div>
          <div className="flex justify-between">
            <span>Format</span>
            <span className="text-red-300">MP4 (H.264)</span>
          </div>
          <div className="flex justify-between">
            <span>Aspect</span>
            <span className="text-red-300">9:16 vertical</span>
          </div>
          <div className="flex justify-between">
            <span>FPS</span>
            <span className="text-red-300">30</span>
          </div>
        </div>

        {d.videoUrl && (
          <>
            <NodeOutputBadge label="Output" value="Ready ✓" />
            <NodePreviewVideo url={d.videoUrl} />
          </>
        )}

        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="video" style={{ top: '50%', background: '#dc2626', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
