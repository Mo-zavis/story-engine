import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeTextArea, NodeSelect, NodePreviewImage, NodeErrorBanner } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { FrameGeneratorNodeData } from '../../types/nodes';

const STYLE_OPTIONS = [
  { value: 'cinematic photorealistic, 8K, dramatic lighting', label: 'Cinematic Photorealistic' },
  { value: 'anime key visual, vibrant colors', label: 'Anime Key Visual' },
  { value: 'digital painting, concept art, detailed', label: 'Concept Art' },
  { value: 'minimalist flat illustration', label: 'Flat Illustration' },
  { value: 'noir black and white photography', label: 'Noir B&W' },
  { value: 'watercolor illustration, soft', label: 'Watercolor' },
  { value: 'comic book, bold lines', label: 'Comic Book' },
  { value: 'hyperrealistic 3D render', label: 'Hyperrealistic 3D' },
];

const RATIO_OPTIONS = [
  { value: '9:16', label: '9:16 (Instagram Reel)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '16:9', label: '16:9 (Landscape)' },
];

export const FrameGeneratorNode = memo(function FrameGeneratorNode({ id, data, selected }: NodeProps) {
  const d = data as FrameGeneratorNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="storyboard" style={{ top: '25%', background: '#0891b2', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="target" position={Position.Left} id="character" style={{ top: '55%', background: '#db2777', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label="Frame Generator"
        icon="🖼️"
        color="#059669"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={280}
      >
        <NodeField label="Image Prompt">
          <NodeTextArea
            value={d.imagePrompt}
            onChange={(v) => updateNodeData(id, { imagePrompt: v })}
            placeholder="Auto-filled from storyboard, or write your own…"
            rows={3}
          />
        </NodeField>

        <NodeField label="Visual Style">
          <NodeSelect value={d.style} onChange={(v) => updateNodeData(id, { style: v })} options={STYLE_OPTIONS} />
        </NodeField>

        <NodeField label="Aspect Ratio">
          <NodeSelect value={d.aspectRatio} onChange={(v) => updateNodeData(id, { aspectRatio: v as '9:16' | '1:1' | '16:9' })} options={RATIO_OPTIONS} />
        </NodeField>

        <NodePreviewImage url={d.imageUrl} />
        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="image" style={{ top: '50%', background: '#059669', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
