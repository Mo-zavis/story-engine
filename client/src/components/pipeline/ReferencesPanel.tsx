import { useState } from 'react';
import { useProjectStore, ProjectReference } from '../../stores/projectStore';
import { useTokens } from '../../stores/themeStore';

const REF_TYPES: { value: ProjectReference['type']; label: string; icon: string }[] = [
  { value: 'color_grading', label: 'Color Grading', icon: '🎨' },
  { value: 'font', label: 'Font / Typography', icon: '🔤' },
  { value: 'style', label: 'Style Reference', icon: '🖼' },
  { value: 'character', label: 'Character Ref', icon: '👤' },
  { value: 'audio', label: 'Audio / Music Ref', icon: '🎵' },
  { value: 'other', label: 'Other', icon: '📎' },
];

const BUILT_IN_FONTS = [
  { name: 'Inter', style: 'Clean sans-serif', loaded: true },
  { name: 'Oswald', style: 'Bold condensed', loaded: true },
  { name: 'Bebas Neue', style: 'Impact / display', loaded: true },
  { name: 'JetBrains Mono', style: 'Technical mono', loaded: true },
];

export function ReferencesPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTokens();
  const { currentProject, addReference, removeReference } = useProjectStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<ProjectReference['type']>('style');
  const [newNotes, setNewNotes] = useState('');
  const [showAddFont, setShowAddFont] = useState(false);
  const [fontName, setFontName] = useState('');
  const [fontUrl, setFontUrl] = useState('');

  if (!isOpen) return null;

  const refs = currentProject?.references || [];
  const fontRefs = refs.filter(r => r.type === 'font');
  const otherRefs = refs.filter(r => r.type !== 'font');

  const handleAdd = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    addReference({ type: newType, label: newLabel, url: newUrl, notes: newNotes });
    setNewLabel('');
    setNewUrl('');
    setNewNotes('');
    setShowAdd(false);
  };

  const handleAddFont = () => {
    if (!fontName.trim() || !fontUrl.trim()) return;
    addReference({
      type: 'font',
      label: fontName.trim(),
      url: fontUrl.trim(),
      notes: 'Custom caption font',
    });
    setFontName('');
    setFontUrl('');
    setShowAddFont(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1" /> {/* click-away area */}
      <div
        className={`w-[420px] h-full ${t.bgSub} border-l ${t.border} shadow-2xl overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-700/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">References</h3>
            <button onClick={onClose} className={`text-xs ${t.textMuted} hover:${t.text}`}>Close</button>
          </div>
          <p className={`text-xs ${t.textMuted} mt-1`}>Color grading, fonts, style refs, and other assets that guide generation</p>
        </div>

        {/* Custom Fonts Section */}
        <div className="p-4 border-b border-neutral-700/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Aa</span>
              <h4 className="text-xs font-semibold uppercase tracking-wider">Custom Fonts</h4>
            </div>
          </div>

          {/* Built-in fonts */}
          <div className="space-y-1 mb-3">
            {BUILT_IN_FONTS.map(f => (
              <div key={f.name} className={`flex items-center justify-between px-3 py-1.5 rounded-md ${t.bg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ fontFamily: f.name }}>{f.name}</span>
                  <span className={`text-[10px] ${t.textMuted}`}>{f.style}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Built-in
                </span>
              </div>
            ))}
          </div>

          {/* User custom fonts */}
          {fontRefs.length > 0 && (
            <div className="space-y-1 mb-3">
              {fontRefs.map(ref => (
                <div key={ref.id} className={`flex items-center justify-between px-3 py-1.5 rounded-md ${t.bgCard} border ${t.borderSub}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{ref.label}</p>
                    <p className={`text-[10px] ${t.textMuted} truncate`}>{ref.url}</p>
                  </div>
                  <button
                    onClick={() => removeReference(ref.id)}
                    className={`text-[10px] ${t.textMuted} hover:text-red-400 ml-2 shrink-0`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAddFont ? (
            <div className={`${t.bgCard} rounded-lg border ${t.accentBorder} p-3 space-y-2`}>
              <p className="text-xs font-medium">Add Custom Font</p>
              <input
                placeholder="Font name (e.g. Montserrat)"
                value={fontName}
                onChange={e => setFontName(e.target.value)}
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-1.5 text-xs ${t.text}`}
              />
              <input
                placeholder="Font file URL (.woff2, .ttf, .otf)"
                value={fontUrl}
                onChange={e => setFontUrl(e.target.value)}
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-1.5 text-xs ${t.text}`}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowAddFont(false)} className={`px-3 py-1.5 text-xs ${t.textSub}`}>Cancel</button>
                <button onClick={handleAddFont} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-500">Add Font</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddFont(true)}
              className={`w-full py-1.5 rounded-lg text-[11px] ${t.textSub} border border-dashed ${t.borderSub} ${t.bgHover} transition-all`}
            >
              + Upload Custom Font
            </button>
          )}
        </div>

        {/* General References */}
        <div className="p-4 space-y-3">
          {otherRefs.length === 0 && !showAdd && (
            <p className={`text-xs ${t.textMuted} text-center py-8`}>No references added yet</p>
          )}

          {otherRefs.map((ref) => {
            const typeInfo = REF_TYPES.find(rt => rt.value === ref.type);
            const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(ref.url);
            return (
              <div key={ref.id} className={`${t.bgCard} rounded-lg border ${t.border} p-3`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{typeInfo?.icon || '📎'}</span>
                    <div>
                      <p className="text-xs font-medium">{ref.label}</p>
                      <p className={`text-[10px] ${t.textMuted}`}>{typeInfo?.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeReference(ref.id)}
                    className={`text-[10px] ${t.textMuted} hover:text-red-400`}
                  >
                    Remove
                  </button>
                </div>
                {isImage && (
                  <img src={ref.url} alt={ref.label} className="w-full rounded-md mb-2 max-h-40 object-cover" />
                )}
                <p className={`text-[10px] ${t.textMuted} truncate`}>{ref.url}</p>
                {ref.notes && <p className={`text-[10px] ${t.textSub} mt-1 italic`}>{ref.notes}</p>}
              </div>
            );
          })}

          {showAdd ? (
            <div className={`${t.bgCard} rounded-lg border ${t.accentBorder} p-4 space-y-3`}>
              <p className="text-xs font-medium">Add Reference</p>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as ProjectReference['type'])}
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-1.5 text-xs ${t.text}`}
              >
                {REF_TYPES.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.icon} {rt.label}</option>
                ))}
              </select>
              <input
                placeholder="Label (e.g. Moonlight Color Grade)"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-1.5 text-xs ${t.text}`}
              />
              <input
                placeholder="URL or file path"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-1.5 text-xs ${t.text}`}
              />
              <textarea
                placeholder="Notes (optional)"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                rows={2}
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-1.5 text-xs ${t.text} resize-none`}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className={`px-3 py-1.5 text-xs ${t.textSub}`}>Cancel</button>
                <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-500">Add</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className={`w-full py-2 rounded-lg text-xs ${t.textSub} border border-dashed ${t.borderSub} ${t.bgHover} transition-all`}
            >
              + Add Reference
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
