import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeInput, NodeTextArea, NodeSelect, NodePreviewImage, NodeErrorBanner } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { CharacterNodeData } from '../../types/nodes';

const STYLE_OPTIONS = [
  { value: 'cinematic photorealistic', label: 'Cinematic Photorealistic' },
  { value: 'anime illustration', label: 'Anime' },
  { value: 'digital painting', label: 'Digital Painting' },
  { value: 'comic book', label: 'Comic Book' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'clay animation', label: 'Claymation' },
  { value: '3D render pixar style', label: 'Pixar 3D' },
  { value: 'line art sketch', label: 'Sketch' },
];

export const CharacterNode = memo(function CharacterNode({ id, data, selected }: NodeProps) {
  const d = data as CharacterNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="story" style={{ top: '30%', background: '#7c3aed', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label={d.label || 'Character Design'}
        icon="🎭"
        color="#db2777"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={280}
      >
        <NodeField label="Character Name">
          <NodeInput
            value={d.characterName}
            onChange={(v) => updateNodeData(id, { characterName: v })}
            placeholder="e.g. Aria Chen"
          />
        </NodeField>

        <NodeField label="Description">
          <NodeTextArea
            value={d.description}
            onChange={(v) => updateNodeData(id, { description: v })}
            placeholder="25-year-old tech founder, sharp eyes, confident stance…"
            rows={3}
          />
        </NodeField>

        <NodeField label="Visual Style">
          <NodeSelect
            value={d.style}
            onChange={(v) => updateNodeData(id, { style: v })}
            options={STYLE_OPTIONS}
          />
        </NodeField>

        <NodePreviewImage url={d.imageUrl} />
        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="character" style={{ top: '40%', background: '#db2777', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="source" position={Position.Right} id="image" style={{ top: '70%', background: '#059669', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
