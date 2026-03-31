import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeTextArea, NodeSelect, NodePreviewAudio, NodeErrorBanner, NodeOutputBadge } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { VoiceoverNodeData } from '../../types/nodes';

const NARRATOR_OPTIONS = [
  { value: 'authority', label: 'Authority (Deep, Commanding)' },
  { value: 'storyteller', label: 'Storyteller (Warm, Narrative)' },
  { value: 'conversational', label: 'Conversational (Natural)' },
  { value: 'documentary', label: 'Documentary (Measured)' },
  { value: 'dramatic', label: 'Dramatic (Intense)' },
];

export const VoiceoverNode = memo(function VoiceoverNode({ id, data, selected }: NodeProps) {
  const d = data as VoiceoverNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="script" style={{ top: '50%', background: '#6b7280', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label="Voiceover"
        icon="🎤"
        color="#2563eb"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={280}
      >
        <NodeField label="Script">
          <NodeTextArea
            value={d.script}
            onChange={(v) => updateNodeData(id, { script: v })}
            placeholder="Enter narration text, or connect from Story Concept…"
            rows={4}
          />
        </NodeField>

        <NodeField label="Narrator Profile">
          <NodeSelect
            value={d.narratorProfile}
            onChange={(v) => updateNodeData(id, { narratorProfile: v as VoiceoverNodeData['narratorProfile'] })}
            options={NARRATOR_OPTIONS}
          />
        </NodeField>

        {d.durationSeconds && (
          <NodeOutputBadge label="Duration" value={`${d.durationSeconds.toFixed(1)}s`} />
        )}

        <NodePreviewAudio url={d.audioUrl} />
        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="audio" style={{ top: '35%', background: '#2563eb', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="source" position={Position.Right} id="duration" style={{ top: '65%', background: '#4b5563', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
