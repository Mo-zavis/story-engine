import { useState } from 'react';
import { NODE_DEFINITIONS, NodeDefinition } from '../../types/nodes';
import { useWorkflowStore } from '../../stores/workflowStore';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'story', label: '✍️ Story' },
  { id: 'visual', label: '🖼️ Visual' },
  { id: 'audio', label: '🎤 Audio' },
  { id: 'output', label: '📤 Output' },
];

export function NodeLibrary() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { addNode } = useWorkflowStore();

  const filtered = NODE_DEFINITIONS.filter((n) => {
    const matchCat = activeCategory === 'all' || n.category === activeCategory;
    const matchSearch = search === '' || n.label.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDragStart = (e: React.DragEvent, def: NodeDefinition) => {
    e.dataTransfer.setData('nodeType', def.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = (def: NodeDefinition) => {
    // Add to center of canvas
    addNode(def.type, { x: 400 + Math.random() * 200, y: 200 + Math.random() * 200 });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 w-56 shrink-0">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-zinc-800">
        <div className="text-xs font-semibold text-zinc-300 mb-2">Node Library</div>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 px-2 py-2 border-b border-zinc-800">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Node cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map((def) => (
          <div
            key={def.type}
            draggable
            onDragStart={(e) => handleDragStart(e, def)}
            onDoubleClick={() => handleDoubleClick(def)}
            className="group rounded-lg p-2.5 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01] select-none"
            style={{
              background: `${def.color}12`,
              border: `1px solid ${def.color}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{def.icon}</span>
              <span className="text-xs font-semibold text-white">{def.label}</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-snug">{def.description}</p>
            <div
              className="mt-1.5 text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: def.color }}
            >
              drag to canvas • double-click to add
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-zinc-800 text-[10px] text-zinc-600">
        Drag nodes onto the canvas to build your workflow
      </div>
    </div>
  );
}
