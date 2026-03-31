import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeSelect, NodePreviewAudio, NodeErrorBanner } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { MusicNodeData } from '../../types/nodes';

const MOOD_OPTIONS = [
  { value: 'emotional', label: 'Emotional & Moving' },
  { value: 'uplifting', label: 'Uplifting' },
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'tense', label: 'Tense / Thriller' },
  { value: 'peaceful', label: 'Peaceful & Calm' },
  { value: 'epic', label: 'Epic / Cinematic' },
  { value: 'playful', label: 'Playful' },
  { value: 'dark', label: 'Dark / Ominous' },
];

const GENRE_OPTIONS = [
  { value: 'cinematic', label: 'Cinematic Orchestral' },
  { value: 'electronic', label: 'Electronic / Synth' },
  { value: 'acoustic', label: 'Acoustic' },
  { value: 'ambient', label: 'Ambient / Lofi' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'pop', label: 'Pop' },
];

// Built-in royalty-free tracks (served from /assets/music)
const PRESET_TRACKS = [
  { value: 'emotional_piano', label: '🎹 Emotional Piano' },
  { value: 'cinematic_build', label: '🎻 Cinematic Build' },
  { value: 'lofi_chill', label: '🎧 Lofi Chill' },
  { value: 'epic_strings', label: '🎺 Epic Strings' },
  { value: 'ambient_pad', label: '🌊 Ambient Pad' },
];

export const MusicNode = memo(function MusicNode({ id, data, selected }: NodeProps) {
  const d = data as MusicNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <NodeCard
        label="Background Music"
        icon="🎵"
        color="#9333ea"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={260}
      >
        <NodeField label="Mood">
          <NodeSelect value={d.mood} onChange={(v) => updateNodeData(id, { mood: v })} options={MOOD_OPTIONS} />
        </NodeField>

        <NodeField label="Genre">
          <NodeSelect value={d.genre} onChange={(v) => updateNodeData(id, { genre: v })} options={GENRE_OPTIONS} />
        </NodeField>

        <div className="text-[9px] text-zinc-600 italic mt-1">Uses royalty-free preset library</div>

        <NodePreviewAudio url={d.audioUrl} />
        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="audio" style={{ top: '50%', background: '#9333ea', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
