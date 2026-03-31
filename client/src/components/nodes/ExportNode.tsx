import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeSelect, NodeTextArea, NodeInput, NodeErrorBanner } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { ExportNodeData } from '../../types/nodes';

const PLATFORM_OPTIONS = [
  { value: 'instagram_reel', label: '📱 Instagram Reel' },
  { value: 'instagram_story', label: '📸 Instagram Story' },
  { value: 'tiktok', label: '🎵 TikTok' },
];

export const ExportNode = memo(function ExportNode({ id, data, selected }: NodeProps) {
  const d = data as ExportNodeData;
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();

  const handleDownload = () => {
    if (d.exportedUrl) window.open(d.exportedUrl, '_blank');
  };

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="video" style={{ top: '50%', background: '#dc2626', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label="Export for Instagram"
        icon="📱"
        color="#16a34a"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={280}
      >
        <NodeField label="Platform">
          <NodeSelect
            value={d.platform}
            onChange={(v) => updateNodeData(id, { platform: v as ExportNodeData['platform'] })}
            options={PLATFORM_OPTIONS}
          />
        </NodeField>

        <NodeField label="Caption">
          <NodeTextArea
            value={d.caption || ''}
            onChange={(v) => updateNodeData(id, { caption: v })}
            placeholder="Add your Instagram caption…"
            rows={3}
          />
        </NodeField>

        <NodeField label="Hashtags">
          <NodeInput
            value={(d.hashtags || []).join(' ')}
            onChange={(v) => updateNodeData(id, { hashtags: v.split(/\s+/).filter(Boolean) })}
            placeholder="#story #film #instagram"
          />
        </NodeField>

        {d.exportedUrl && (
          <button
            onClick={handleDownload}
            className="nodrag w-full mt-2 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#16a34a' }}
          >
            ↓ Download Final Video
          </button>
        )}

        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="exported" style={{ top: '50%', background: '#16a34a', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
