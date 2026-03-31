import { Handle, Position } from '@xyflow/react';

interface PortHandleProps {
  type: 'source' | 'target';
  id: string;
  label?: string;
  portType?: string;
  position?: Position;
}

const portColors: Record<string, string> = {
  story_json: '#7c3aed',
  character_ref: '#db2777',
  storyboard_json: '#0891b2',
  image_data: '#059669',
  video_clip: '#d97706',
  audio_data: '#2563eb',
  text: '#6b7280',
  any: '#4b5563',
};

export function PortHandle({ type, id, label, portType = 'any', position }: PortHandleProps) {
  const color = portColors[portType] || '#4b5563';
  const pos = position || (type === 'target' ? Position.Left : Position.Right);

  return (
    <div
      className="flex items-center gap-1"
      style={{
        position: 'relative',
        justifyContent: type === 'target' ? 'flex-start' : 'flex-end',
      }}
    >
      {type === 'target' && label && (
        <span className="text-[9px] text-zinc-500 ml-3">{label}</span>
      )}
      <Handle
        type={type}
        position={pos}
        id={id}
        style={{
          width: 10,
          height: 10,
          background: color,
          border: '2px solid rgba(255,255,255,0.15)',
          borderRadius: '50%',
        }}
      />
      {type === 'source' && label && (
        <span className="text-[9px] text-zinc-500 mr-3">{label}</span>
      )}
    </div>
  );
}
