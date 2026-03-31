import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeTextArea, NodeInput, NodePreviewAudio, NodeErrorBanner } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { SfxNodeData } from '../../types/nodes';

export const SfxNode = memo(function SfxNode({ id, data, selected }: NodeProps) {
  const d = data as SfxNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="storyboard" style={{ top: '30%', background: '#0891b2', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="target" position={Position.Left} id="audioDuration" style={{ top: '60%', background: '#2563eb', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label="Scene Audio / SFX"
        icon="🔊"
        color="#0ea5e9"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={280}
      >
        <NodeField label="Scene">
          <NodeInput
            value={d.sceneLabel || ''}
            onChange={(v) => updateNodeData(id, { sceneLabel: v })}
            placeholder="e.g. Scene 1 — The Glow"
          />
        </NodeField>

        <NodeField label="Ambient Bed">
          <NodeTextArea
            value={d.ambientPrompt || ''}
            onChange={(v) => updateNodeData(id, { ambientPrompt: v })}
            placeholder="Continuous background: distant traffic, room tone, wind..."
            rows={2}
          />
        </NodeField>

        <NodeField label="Foley / Action Sounds">
          <NodeTextArea
            value={d.foleyPrompt || ''}
            onChange={(v) => updateNodeData(id, { foleyPrompt: v })}
            placeholder="Event sounds: footsteps, door handle, ball hitting wall..."
            rows={2}
          />
        </NodeField>

        <NodeField label="Transition Sound (J-Cut Pre-lap)">
          <NodeTextArea
            value={d.transitionSound || ''}
            onChange={(v) => updateNodeData(id, { transitionSound: v })}
            placeholder="Next scene's ambient that bleeds in early: rain starting, crowd murmur..."
            rows={2}
          />
        </NodeField>

        <NodeField label="Pre-lap Offset">
          <div className="flex items-center gap-2">
            <NodeInput
              type="number"
              value={d.prelapMs || 300}
              onChange={(v) => updateNodeData(id, { prelapMs: parseInt(v) || 300 })}
            />
            <span className="text-[9px] text-zinc-500">ms before cut</span>
          </div>
        </NodeField>

        {d.audioUrl && (
          <div>
            <div className="text-[9px] text-zinc-500 mb-0.5 uppercase tracking-wider">Scene Audio</div>
            <NodePreviewAudio url={d.audioUrl} />
          </div>
        )}
        {d.transitionAudioUrl && (
          <div>
            <div className="text-[9px] text-zinc-500 mb-0.5 uppercase tracking-wider">Transition Pre-lap</div>
            <NodePreviewAudio url={d.transitionAudioUrl} />
          </div>
        )}
        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="sceneAudio" style={{ top: '35%', background: '#0ea5e9', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="source" position={Position.Right} id="transitionAudio" style={{ top: '65%', background: '#06b6d4', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
