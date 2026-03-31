import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeCard, NodeField, NodeSelect, NodeInput, NodeTextArea, NodePreviewVideo, NodePreviewImage, NodeErrorBanner } from '../ui/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { AnimationNodeData } from '../../types/nodes';

const SCENE_TYPES = [
  { value: 'action', label: 'Action Scene (subject moves, things happen)' },
  { value: 'still_camera', label: 'Still Moment (camera moves over still subject)' },
  { value: 'custom', label: 'Custom (write full prompt)' },
];

const CAMERA_ASSISTS = [
  { value: 'none', label: 'No camera assist (Kling decides)' },
  { value: 'static', label: 'Static / locked' },
  { value: 'handheld', label: 'Handheld micro-shake' },
  { value: 'push_in', label: 'Push-In (dolly toward)' },
  { value: 'pull_out', label: 'Pull-Out (dolly away)' },
  { value: 'track_left', label: 'Track Left' },
  { value: 'track_right', label: 'Track Right' },
  { value: 'pan_left', label: 'Pan Left' },
  { value: 'pan_right', label: 'Pan Right' },
  { value: 'tilt_up', label: 'Tilt Up' },
  { value: 'tilt_down', label: 'Tilt Down' },
  { value: 'dolly_circle', label: 'Orbit around subject' },
  { value: 'crane_up', label: 'Crane Up (rising)' },
  { value: 'crane_down', label: 'Crane Down (descending)' },
  { value: 'drift_up', label: 'Drift Up (dreamlike)' },
  { value: 'drift_lateral', label: 'Drift Lateral (glide)' },
  { value: 'pulse', label: 'Pulse / Breathe' },
  { value: 'ken_burns', label: 'Ken Burns (pan + zoom)' },
  { value: 'zoom_in_slow', label: 'Slow Zoom In' },
  { value: 'zoom_out_slow', label: 'Slow Zoom Out' },
  { value: 'snap_zoom', label: 'Snap Zoom (fast punch)' },
  { value: 'whip_pan', label: 'Whip Pan (fast snap)' },
  { value: 'selfie_handheld', label: 'Selfie / front cam' },
  { value: 'phone_propped', label: 'Phone propped on surface' },
];

export const AnimationNode = memo(function AnimationNode({ id, data, selected }: NodeProps) {
  const d = data as AnimationNodeData & {
    sceneType?: string;
    actionPrompt?: string;
    cameraAssist?: string;
    customMotionPrompt?: string;
  };
  const { updateNodeData, executeNode, deleteNode } = useWorkflowStore();
  const sceneType = d.sceneType || (d.motionPreset === 'custom' ? 'custom' : 'still_camera');

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="image" style={{ top: '25%', background: '#059669', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
      <Handle type="target" position={Position.Left} id="audioDuration" style={{ top: '55%', background: '#2563eb', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />

      <NodeCard
        label="Video Generation"
        icon="🎬"
        color="#d97706"
        status={d.status}
        selected={selected}
        onRun={() => executeNode(id)}
        onDelete={() => deleteNode(id)}
        minWidth={290}
      >
        {/* Primary: what kind of scene is this? */}
        <NodeField label="Scene Type">
          <NodeSelect
            value={sceneType}
            onChange={(v) => updateNodeData(id, { sceneType: v, motionPreset: v === 'custom' ? 'custom' : d.motionPreset })}
            options={SCENE_TYPES}
          />
        </NodeField>

        {/* Action scenes: describe what HAPPENS */}
        {sceneType === 'action' && (
          <NodeField label="What happens in this scene?">
            <NodeTextArea
              value={d.actionPrompt || ''}
              onChange={(v) => updateNodeData(id, { actionPrompt: v })}
              placeholder="e.g. Young man swings racket at ball and misses completely, ball bounces off the floor, he laughs at himself, fluorescent court lighting"
              rows={4}
            />
          </NodeField>
        )}

        {/* Action scenes also get a camera assist */}
        {sceneType === 'action' && (
          <NodeField label="Camera (optional assist)">
            <NodeSelect
              value={d.cameraAssist || 'none'}
              onChange={(v) => updateNodeData(id, { cameraAssist: v })}
              options={CAMERA_ASSISTS}
            />
          </NodeField>
        )}

        {/* Still scenes: camera motion is primary */}
        {sceneType === 'still_camera' && (
          <NodeField label="Camera Motion">
            <NodeSelect
              value={d.motionPreset || 'drift_up'}
              onChange={(v) => updateNodeData(id, { motionPreset: v })}
              options={CAMERA_ASSISTS.filter(o => o.value !== 'none')}
            />
          </NodeField>
        )}

        {/* Custom: full prompt */}
        {sceneType === 'custom' && (
          <NodeField label="Full Video Prompt">
            <NodeTextArea
              value={d.customMotionPrompt || ''}
              onChange={(v) => updateNodeData(id, { customMotionPrompt: v })}
              placeholder="Describe everything: subject action, environment, camera movement, mood, pacing..."
              rows={5}
            />
          </NodeField>
        )}

        <NodeField label="Duration (seconds)">
          <div className="flex items-center gap-2">
            <NodeInput
              type="number"
              value={d.durationSeconds}
              onChange={(v) => updateNodeData(id, { durationSeconds: parseFloat(v) || 5 })}
            />
            <span className="text-[9px] text-zinc-500 whitespace-nowrap">VO overrides</span>
          </div>
        </NodeField>

        {d.sourceImageUrl && !d.videoUrl && (
          <NodePreviewImage url={d.sourceImageUrl} />
        )}
        {d.videoUrl && <NodePreviewVideo url={d.videoUrl} />}
        <NodeErrorBanner error={d.error} />
      </NodeCard>

      <Handle type="source" position={Position.Right} id="video" style={{ top: '50%', background: '#d97706', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)' }} />
    </div>
  );
});
