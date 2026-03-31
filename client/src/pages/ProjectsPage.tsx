import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore, Project } from '../stores/projectStore';
import { useTokens, useThemeStore } from '../stores/themeStore';
import { FSP_UNDERDOG_TEMPLATE } from '../templates/fsp-underdog';
import { FSP_UNDERDOG_EP1_TEMPLATE } from '../templates/fsp-underdog-ep1';
import { useWorkflowStore } from '../stores/workflowStore';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ProjectsPage() {
  const t = useTokens();
  const { theme, toggleTheme } = useThemeStore();
  const { projects, createProject, deleteProject, openProject, deduplicateProjects, loadWorkflowData } = useProjectStore();
  const { loadTemplate } = useWorkflowStore();
  const navigate = useNavigate();

  // Clean up duplicates on mount
  useEffect(() => { deduplicateProjects(); }, [deduplicateProjects]);

  // Sort: most recently updated first
  const sorted = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const project = await createProject(newName, newDesc);
    setShowNew(false);
    setNewName('');
    setNewDesc('');
    openProject(project.id);
    navigate(`/project/${project.id}`);
  };

  const handleOpen = (p: Project) => {
    openProject(p.id);
    // Load saved workflow data for this project
    const saved = loadWorkflowData(p.id);
    if (saved && saved.nodes && saved.nodes.length > 0) {
      loadTemplate(saved.nodes as any, saved.edges as any, p.name);
    } else if (p.name === 'The Underdog — 5 Episodes') {
      // Fallback: first open of Underdog, load template and save it
      loadTemplate(FSP_UNDERDOG_TEMPLATE.nodes, FSP_UNDERDOG_TEMPLATE.edges, FSP_UNDERDOG_TEMPLATE.name);
    }
    navigate(`/project/${p.id}`);
  };

  const handleLoadUnderdog = async () => {
    // Reuse existing Underdog project if one already exists
    const existing = projects.find(p => p.name === 'The Underdog — 5 Episodes');
    if (existing) {
      loadTemplate(FSP_UNDERDOG_TEMPLATE.nodes, FSP_UNDERDOG_TEMPLATE.edges, FSP_UNDERDOG_TEMPLATE.name);
      openProject(existing.id);
      navigate(`/project/${existing.id}`);
      return;
    }
    const project = await createProject('The Underdog — 5 Episodes', 'FSP Content Series: Kofi Mensah, 19, Brixton. 100-day squash challenge.');
    loadTemplate(FSP_UNDERDOG_TEMPLATE.nodes, FSP_UNDERDOG_TEMPLATE.edges, FSP_UNDERDOG_TEMPLATE.name);
    openProject(project.id);
    navigate(`/project/${project.id}`);
  };

  const handleLoadEp1 = async () => {
    // Always delete stale project and recreate with latest template data
    const existing = projects.find(p => p.name === 'The Underdog — Episode 1');
    if (existing) {
      deleteProject(existing.id);
    }
    const project = await createProject('The Underdog — Episode 1', 'Episode 1: The Spark — Kofi discovers squash, starts the 100-day challenge, finds FSP.');
    loadTemplate(FSP_UNDERDOG_EP1_TEMPLATE.nodes, FSP_UNDERDOG_EP1_TEMPLATE.edges, FSP_UNDERDOG_EP1_TEMPLATE.name);
    openProject(project.id);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`border-b ${t.border} px-8 py-5 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">S</div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Story Engine</h1>
            <p className={`text-xs ${t.textMuted}`}>AI Video Production Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/system-flow')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all"
          >
            System Flow
          </button>
          <button
            onClick={() => navigate('/production-team')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            Team
          </button>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-lg text-xs ${t.bgSub} ${t.border} border ${t.textSub} ${t.bgHover} transition-all`}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
            <p className={`text-sm ${t.textSub} mt-1`}>Your video production workflows</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            + New Project
          </button>
        </div>

        {/* Project Grid */}
        {sorted.length === 0 && !showNew ? (
          <div className={`${t.bgCard} rounded-2xl border ${t.border} p-16 text-center`}>
            <div className="text-4xl opacity-20 mb-4">🎬</div>
            <p className={`${t.textSub} text-sm mb-4`}>No projects yet</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleLoadUnderdog}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white"
              >
                Start with FSP: The Underdog
              </button>
              <button
                onClick={() => setShowNew(true)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                Create from scratch
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((p, i) => (
              <button
                key={p.id}
                onClick={() => handleOpen(p)}
                className={`${t.bgCard} rounded-xl border ${i === 0 ? `${t.accentBorder} border-2` : t.border} p-5 text-left ${t.bgHover} transition-all group relative`}
              >
                {i === 0 && (
                  <span className={`absolute -top-2 left-4 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full bg-amber-500 text-white`}>
                    Latest
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg">
                    🎬
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                    className={`opacity-0 group-hover:opacity-100 text-xs ${t.textMuted} hover:text-red-400 transition-all px-1`}
                  >
                    Delete
                  </button>
                </div>
                <h3 className="font-medium text-sm mb-1">{p.name}</h3>
                <p className={`text-xs ${t.textMuted} line-clamp-2`}>{p.description || 'No description'}</p>
                <p className={`text-[10px] ${t.textMuted} mt-3`}>
                  {timeAgo(p.updatedAt)}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* New project modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)}>
            <div className={`${t.bgSub} rounded-2xl border ${t.border} p-6 w-[420px] shadow-2xl`} onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold mb-4">New Project</h3>
              <label className={`text-xs ${t.textSub} block mb-1`}>Project Name</label>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. The Underdog Series"
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-2 text-sm ${t.text} focus:outline-none focus:ring-1 focus:ring-amber-500 mb-3`}
              />
              <label className={`text-xs ${t.textSub} block mb-1`}>Description</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Brief description of the project..."
                rows={3}
                className={`w-full ${t.bg} border ${t.border} rounded-lg px-3 py-2 text-sm ${t.text} focus:outline-none focus:ring-1 focus:ring-amber-500 mb-4 resize-none`}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNew(false)} className={`px-4 py-2 rounded-lg text-xs ${t.textSub} ${t.bgHover} border ${t.border}`}>Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
