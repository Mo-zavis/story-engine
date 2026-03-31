import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeTextArea, NodeSelect, NodeInput, NodeErrorBanner, NodeOutputBadge } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { StoryConceptNodeData } from '../../types/nodes';

const GENRE_OPTIONS = [
  { value: 'Drama', label: 'Drama' },
  { value: 'Comedy', label: 'Comedy' },
  { value: 'Thriller', label: 'Thriller' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Documentary', label: 'Documentary' },
  { value: 'Inspirational', label: 'Inspirational' },
  { value: 'Horror', label: 'Horror' },
  { value: 'Action', label: 'Action' },
  { value: 'Sci-Fi', label: 'Sci-Fi' },
  { value: 'Fantasy', label: 'Fantasy' },
];

const TONE_OPTIONS = [
  { value: 'Inspirational', label: 'Inspirational' },
  { value: 'Dark', label: 'Dark & Gritty' },
  { value: 'Playful', label: 'Playful & Upbeat' },
  { value: 'Cinematic', label: 'Cinematic' },
  { value: 'Emotional', label: 'Emotional' },
  { value: 'Mysterious', label: 'Mysterious' },
  { value: 'Humorous', label: 'Humorous' },
  { value: 'Suspenseful', label: 'Suspenseful' },
];

export const StoryConceptNode = memo(function StoryConceptNode({ id, data, selected }: NodeProps) {
  const d = data as StoryConceptNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <NodeCard
        label={d.label || 'Story Concept'}
        icon="✍️"
        color="#7c3aed"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={300}
      >
        <NodeField label="Story Concept">
          <NodeTextArea
            value={d.concept}
            onChange={(v) => updateNodeData(id, { concept: v })}
            placeholder="A young founder discovers her startup's AI has developed consciousness…"
            rows={4}
          />
        </NodeField>

        <div className="grid grid-cols-2 gap-2">
          <NodeField label="Genre">
            <NodeSelect
              value={d.genre}
              onChange={(v) => updateNodeData(id, { genre: v })}
              options={GENRE_OPTIONS}
            />
          </NodeField>
          <NodeField label="Tone">
            <NodeSelect
              value={d.tone}
              onChange={(v) => updateNodeData(id, { tone: v })}
              options={TONE_OPTIONS}
            />
          </NodeField>
        </div>

        <NodeField label="Target Duration (seconds)">
          <NodeInput
            type="number"
            value={d.targetDuration}
            onChange={(v) => updateNodeData(id, { targetDuration: parseInt(v) || 60 })}
            placeholder="60"
          />
        </NodeField>

        {d.storyOutput && (
          <div className="mt-2 space-y-1 p-2 rounded-lg bg-purple-950/30 border border-purple-800/30">
            <div className="text-[10px] text-purple-300 font-semibold">{d.storyOutput.title}</div>
            <div className="text-[10px] text-zinc-400">{d.storyOutput.logline}</div>
            <NodeOutputBadge label="Scenes" value={d.storyOutput.scenes.length} />
            <NodeOutputBadge label="Characters" value={d.storyOutput.characters.length} />
          </div>
        )}

        <NodeErrorBanner error={d.error} />
      </NodeCard>

      {/* Output handles */}
      <Handle type="source" position={Position.Right} id="story" style={{ top: '40%', background: '#7c3aed', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="source" position={Position.Right} id="script" style={{ top: '70%', background: '#6b7280', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
