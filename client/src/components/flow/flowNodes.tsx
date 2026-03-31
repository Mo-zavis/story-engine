import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

/* ------------------------------------------------------------------ */
/*  Shared styling helpers                                             */
/* ------------------------------------------------------------------ */

const CATEGORY_COLORS: Record<string, { border: string; bg: string; glow: string; text: string; dot: string }> = {
  input:    { border: '#6366f1', bg: 'rgba(99,102,241,0.08)',  glow: 'rgba(99,102,241,0.25)',  text: '#a5b4fc', dot: '#818cf8' },
  ai:       { border: '#7c3aed', bg: 'rgba(124,58,237,0.08)', glow: 'rgba(124,58,237,0.25)', text: '#c4b5fd', dot: '#a78bfa' },
  visual:   { border: '#059669', bg: 'rgba(5,150,105,0.08)',  glow: 'rgba(5,150,105,0.25)',  text: '#6ee7b7', dot: '#34d399' },
  audio:    { border: '#2563eb', bg: 'rgba(37,99,235,0.08)',  glow: 'rgba(37,99,235,0.25)',  text: '#93c5fd', dot: '#60a5fa' },
  compile:  { border: '#dc2626', bg: 'rgba(220,38,38,0.08)',  glow: 'rgba(220,38,38,0.25)',  text: '#fca5a5', dot: '#f87171' },
  export:   { border: '#16a34a', bg: 'rgba(22,163,74,0.08)',  glow: 'rgba(22,163,74,0.25)',  text: '#86efac', dot: '#4ade80' },
  service:  { border: '#d97706', bg: 'rgba(217,119,6,0.08)',  glow: 'rgba(217,119,6,0.25)',  text: '#fcd34d', dot: '#fbbf24' },
  storage:  { border: '#64748b', bg: 'rgba(100,116,139,0.08)',glow: 'rgba(100,116,139,0.25)',text: '#cbd5e1', dot: '#94a3b8' },
  quality:  { border: '#db2777', bg: 'rgba(219,39,119,0.08)', glow: 'rgba(219,39,119,0.25)', text: '#f9a8d4', dot: '#f472b6' },
};

function getColors(category: string) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.service;
}

/* ------------------------------------------------------------------ */
/*  Stage Node — main pipeline stages                                  */
/* ------------------------------------------------------------------ */

interface StageData {
  label: string;
  category: string;
  description: string;
  tech: string;
  icon: string;
  details?: string[];
  hasInput?: boolean;
  hasOutput?: boolean;
  [key: string]: unknown;
}

export const StageNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as StageData;
  const c = getColors(d.category);

  return (
    <div
      className="rounded-xl min-w-[220px] max-w-[260px] transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        boxShadow: `0 0 20px ${c.glow}, 0 4px 12px rgba(0,0,0,0.3)`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {d.hasInput !== false && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: c.border, width: 8, height: 8, border: `2px solid ${c.bg}` }}
        />
      )}

      {/* Header */}
      <div className="px-3 pt-3 pb-1.5 flex items-center gap-2">
        <span className="text-lg">{d.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold tracking-wide" style={{ color: c.text }}>
            {d.label}
          </div>
          <div className="text-[9px] text-neutral-500 font-mono">{d.tech}</div>
        </div>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: c.dot }} />
      </div>

      {/* Description */}
      <div className="px-3 pb-2">
        <div className="text-[10px] text-neutral-400 leading-relaxed">{d.description}</div>
      </div>

      {/* Details list */}
      {d.details && d.details.length > 0 && (
        <div className="px-3 pb-2.5 flex flex-wrap gap-1">
          {d.details.map((detail: string, i: number) => (
            <span
              key={i}
              className="text-[8px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: `${c.border}20`, color: c.text }}
            >
              {detail}
            </span>
          ))}
        </div>
      )}

      {d.hasOutput !== false && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: c.border, width: 8, height: 8, border: `2px solid ${c.bg}` }}
        />
      )}
    </div>
  );
});
StageNode.displayName = 'StageNode';

/* ------------------------------------------------------------------ */
/*  Service Node — external APIs and services                          */
/* ------------------------------------------------------------------ */

interface ServiceData {
  label: string;
  category: string;
  icon: string;
  provider: string;
  endpoints?: string[];
  hasInput?: boolean;
  hasOutput?: boolean;
  [key: string]: unknown;
}

export const ServiceNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as ServiceData;
  const c = getColors(d.category);

  return (
    <div
      className="rounded-lg min-w-[180px] max-w-[220px]"
      style={{
        background: `linear-gradient(135deg, ${c.bg}, rgba(0,0,0,0.3))`,
        border: `1px dashed ${c.border}80`,
        boxShadow: `0 0 12px ${c.glow}`,
      }}
    >
      {d.hasInput !== false && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: c.border, width: 6, height: 6 }}
        />
      )}

      <div className="px-3 py-2.5 flex items-center gap-2">
        <span className="text-base">{d.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold" style={{ color: c.text }}>{d.label}</div>
          <div className="text-[8px] text-neutral-500">{d.provider}</div>
        </div>
      </div>

      {d.endpoints && d.endpoints.length > 0 && (
        <div className="px-3 pb-2 flex flex-col gap-0.5">
          {d.endpoints.map((ep: string, i: number) => (
            <div key={i} className="text-[8px] font-mono text-neutral-500">{ep}</div>
          ))}
        </div>
      )}

      {d.hasOutput !== false && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: c.border, width: 6, height: 6 }}
        />
      )}
    </div>
  );
});
ServiceNode.displayName = 'ServiceNode';

/* ------------------------------------------------------------------ */
/*  Group Node — visual grouping label                                 */
/* ------------------------------------------------------------------ */

interface GroupData {
  label: string;
  category: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export const GroupNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as GroupData;
  const c = getColors(d.category);

  return (
    <div
      className="rounded-2xl"
      style={{
        width: d.width || 500,
        height: d.height || 300,
        background: `${c.bg}`,
        border: `1px solid ${c.border}25`,
        pointerEvents: 'none',
      }}
    >
      <div
        className="absolute -top-3 left-4 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase"
        style={{ background: '#0d0d0d', color: c.text, border: `1px solid ${c.border}40` }}
      >
        {d.label}
      </div>
    </div>
  );
});
GroupNode.displayName = 'GroupNode';

/* ------------------------------------------------------------------ */
/*  Metric Node — key stats                                            */
/* ------------------------------------------------------------------ */

interface MetricData {
  label: string;
  value: string;
  unit?: string;
  category: string;
  [key: string]: unknown;
}

export const MetricNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as MetricData;
  const c = getColors(d.category);

  return (
    <div
      className="rounded-lg px-3 py-2 text-center min-w-[100px]"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}40`,
      }}
    >
      <div className="text-lg font-bold font-mono" style={{ color: c.text }}>{d.value}</div>
      <div className="text-[8px] text-neutral-500 uppercase tracking-wider">{d.label}</div>
      {d.unit && <div className="text-[7px] text-neutral-600">{d.unit}</div>}
    </div>
  );
});
MetricNode.displayName = 'MetricNode';

/* ------------------------------------------------------------------ */
/*  Export node type map                                                */
/* ------------------------------------------------------------------ */

export const flowNodeTypes = {
  stage: StageNode,
  service: ServiceNode,
  group: GroupNode,
  metric: MetricNode,
};
