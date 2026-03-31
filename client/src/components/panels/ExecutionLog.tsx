import { useWorkflowStore, LogEntry } from '../../stores/workflowStore';
import { useEffect, useRef } from 'react';

const levelConfig = {
  info: { color: 'text-zinc-400', bg: '' },
  success: { color: 'text-emerald-400', bg: '' },
  error: { color: 'text-red-400', bg: 'bg-red-950/20' },
  warn: { color: 'text-yellow-400', bg: 'bg-yellow-950/20' },
};

const levelIcon = {
  info: '●',
  success: '✓',
  error: '✕',
  warn: '⚠',
};

function LogLine({ entry }: { entry: LogEntry }) {
  const lc = levelConfig[entry.level];
  return (
    <div className={`flex items-start gap-2 px-3 py-1 text-[10px] font-mono ${lc.bg}`}>
      <span className={`shrink-0 ${lc.color}`}>{levelIcon[entry.level]}</span>
      <span className="text-zinc-600 shrink-0">
        {entry.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      {entry.nodeLabel && (
        <span className="text-zinc-500 shrink-0">[{entry.nodeLabel}]</span>
      )}
      <span className={lc.color}>{entry.message}</span>
    </div>
  );
}

export function ExecutionLog() {
  const { executionLog, clearLog } = useWorkflowStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionLog.length]);

  return (
    <div className="flex flex-col h-48 bg-zinc-950 border-t border-zinc-800 shrink-0">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Execution Log</span>
        <button
          onClick={clearLog}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {executionLog.length === 0 ? (
          <div className="px-3 py-3 text-[10px] text-zinc-700 italic">
            Run a node to see execution output here…
          </div>
        ) : (
          executionLog.map((e) => <LogLine key={e.id} entry={e} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
