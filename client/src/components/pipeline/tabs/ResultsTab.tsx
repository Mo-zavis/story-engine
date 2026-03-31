import { useWorkflowStore } from '../../../stores/workflowStore';
import { useTokens } from '../../../stores/themeStore';

export function ResultsTab() {
  const t = useTokens();
  const { nodes } = useWorkflowStore();

  const total = nodes.length;
  const done = nodes.filter(n => n.data.status === 'done').length;
  const errors = nodes.filter(n => n.data.status === 'error').length;
  const running = nodes.filter(n => n.data.status === 'running').length;
  const idle = nodes.filter(n => n.data.status === 'idle').length;

  const byType = [
    { label: 'Story Concepts', type: 'storyConcept', icon: '📖' },
    { label: 'Characters', type: 'character', icon: '👤' },
    { label: 'Storyboards', type: 'storyboard', icon: '📋' },
    { label: 'Frames', type: 'frameGenerator', icon: '🖼' },
    { label: 'Animations', type: 'animation', icon: '🎥' },
    { label: 'Voiceovers', type: 'voiceover', icon: '🎙' },
    { label: 'Music', type: 'music', icon: '🎵' },
    { label: 'Compiled', type: 'compile', icon: '🎬' },
    { label: 'Exported', type: 'export', icon: '📤' },
  ];

  // Gather all output assets
  const allImages = nodes.filter(n => n.data.imageUrl).map(n => ({ label: n.data.label, url: n.data.imageUrl }));
  const allVideos = nodes.filter(n => n.data.videoUrl).map(n => ({ label: n.data.label, url: n.data.videoUrl }));
  const allAudio = nodes.filter(n => n.data.audioUrl).map(n => ({ label: n.data.label, url: n.data.audioUrl }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-lg font-semibold">Results Overview</h2>

      {/* Progress bar */}
      <div className={`${t.bgCard} rounded-xl border ${t.border} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Pipeline Progress</p>
          <p className={`text-xs ${t.textMuted}`}>{done}/{total} nodes complete</p>
        </div>
        <div className={`w-full h-2 rounded-full ${t.bg} overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3">
          <Stat label="Done" value={done} color="text-emerald-400" />
          <Stat label="Running" value={running} color="text-yellow-400" />
          <Stat label="Errors" value={errors} color="text-red-400" />
          <Stat label="Pending" value={idle} color={t.textMuted} />
        </div>
      </div>

      {/* By type breakdown */}
      <div className={`${t.bgCard} rounded-xl border ${t.border} p-5`}>
        <p className="text-sm font-medium mb-4">Node Breakdown</p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {byType.map(({ label, type, icon }) => {
            const typeNodes = nodes.filter(n => n.type === type);
            const typeDone = typeNodes.filter(n => n.data.status === 'done').length;
            return (
              <div key={type} className={`${t.bg} rounded-lg border ${t.borderSub} p-3 text-center`}>
                <div className="text-lg mb-1">{icon}</div>
                <p className="text-xs font-medium">{typeDone}/{typeNodes.length}</p>
                <p className={`text-[10px] ${t.textMuted}`}>{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset gallery */}
      {allImages.length > 0 && (
        <div>
          <p className={`text-sm font-semibold ${t.textSub} mb-3`}>Generated Images ({allImages.length})</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {allImages.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noreferrer" className="block">
                <img src={img.url} alt={img.label} className="w-full aspect-square object-cover rounded-lg border border-neutral-700/30 hover:ring-2 hover:ring-amber-500/50 transition-all" />
              </a>
            ))}
          </div>
        </div>
      )}

      {allVideos.length > 0 && (
        <div>
          <p className={`text-sm font-semibold ${t.textSub} mb-3`}>Generated Videos ({allVideos.length})</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allVideos.map((vid, i) => (
              <video key={i} src={vid.url} controls className="w-full rounded-lg border border-neutral-700/30" />
            ))}
          </div>
        </div>
      )}

      {allAudio.length > 0 && (
        <div>
          <p className={`text-sm font-semibold ${t.textSub} mb-3`}>Generated Audio ({allAudio.length})</p>
          <div className="space-y-2">
            {allAudio.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 ${t.bgCard} rounded-lg border ${t.border} p-3`}>
                <span className={`text-xs ${t.textSub} w-32 truncate`}>{a.label}</span>
                <audio controls src={a.url} className="flex-1 h-8" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-sm font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-neutral-500">{label}</p>
    </div>
  );
}
