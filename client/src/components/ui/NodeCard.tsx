import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';

interface NodeCardProps {
  label: string;
  icon: string;
  color: string;
  status: 'idle' | 'running' | 'done' | 'error';
  selected?: boolean;
  children: React.ReactNode;
  onRun?: () => void;
  onDelete?: () => void;
  minWidth?: number;
}

const statusConfig = {
  idle: { dot: 'bg-zinc-500', text: 'text-zinc-400', label: 'Ready' },
  running: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400', label: 'Running…' },
  done: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Done' },
  error: { dot: 'bg-red-500', text: 'text-red-400', label: 'Error' },
};

export const NodeCard = memo(function NodeCard({
  label,
  icon,
  color,
  status,
  selected,
  children,
  onRun,
  onDelete,
  minWidth = 280,
}: NodeCardProps) {
  const sc = statusConfig[status];

  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl transition-all duration-150"
      style={{
        minWidth,
        background: 'rgba(18, 18, 22, 0.96)',
        border: selected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? `0 0 0 1px ${color}40, 0 8px 40px ${color}20` : '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 select-none"
        style={{ background: `${color}18`, borderBottom: `1px solid ${color}30` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">{icon}</span>
          <span className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'Inter' }}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Status pill */}
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            <span className={`text-[10px] font-medium ${sc.text}`}>{sc.label}</span>
          </div>
          {/* Run button */}
          {onRun && (
            <button
              onClick={(e) => { e.stopPropagation(); onRun(); }}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: color, color: 'white' }}
              title="Run this node"
            >
              <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor">
                <path d="M0 0.5L8 4.5L0 8.5V0.5Z" />
              </svg>
            </button>
          )}
          {/* Delete */}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-5 h-5 rounded-full flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors"
              title="Delete node"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
});

// ─── Field components for node interiors ────────────────────────────────────

export function NodeField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</label>
      {children}
    </div>
  );
}

export function NodeTextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="nodrag w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-500 transition-colors font-mono"
    />
  );
}

export function NodeInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="nodrag w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
    />
  );
}

export function NodeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="nodrag w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function NodePreviewImage({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
      <img src={url} alt="preview" className="w-full object-cover max-h-36" />
    </div>
  );
}

export function NodePreviewAudio({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="mt-2">
      <audio controls src={url} className="w-full h-8 nodrag" style={{ accentColor: '#22c55e' }} />
    </div>
  );
}

export function NodePreviewVideo({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
      <video src={url} controls className="w-full max-h-40 nodrag" />
    </div>
  );
}

export function NodeErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="mt-2 px-2 py-1.5 rounded-lg bg-red-950 border border-red-800 text-xs text-red-300">
      ⚠ {error}
    </div>
  );
}

export function NodeOutputBadge({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-zinc-500">{label}</span>
      <span className="text-emerald-400 font-mono">{value}</span>
    </div>
  );
}
