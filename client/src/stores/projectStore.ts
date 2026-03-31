import { create } from 'zustand';
import { api } from '../lib/api';

export interface ProjectWorkflowData {
  nodes: unknown[];
  edges: unknown[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  workflowId?: string;
  thumbnail?: string;
  references?: ProjectReference[];
}

export interface ProjectReference {
  id: string;
  type: 'color_grading' | 'font' | 'style' | 'character' | 'audio' | 'other';
  label: string;
  url: string; // local path or uploaded URL
  notes?: string;
}

export interface CharacterVersion {
  id: string;
  characterName: string;
  imageUrl: string;
  prompt: string;
  timestamp: string;
  notes?: string;
  isActive: boolean;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  characterHistory: Record<string, CharacterVersion[]>; // keyed by character name

  loadProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<Project>;
  openProject: (id: string) => void;
  closeProject: () => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  deduplicateProjects: () => void;

  saveWorkflowData: (projectId: string, data: ProjectWorkflowData) => void;
  loadWorkflowData: (projectId: string) => ProjectWorkflowData | null;

  addReference: (ref: Omit<ProjectReference, 'id'>) => void;
  removeReference: (id: string) => void;

  addCharacterVersion: (name: string, version: Omit<CharacterVersion, 'id' | 'timestamp'>) => void;
  setActiveCharacterVersion: (name: string, versionId: string) => void;
}

let _counter = 0;
function uid() { return `${Date.now()}-${++_counter}`; }

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: JSON.parse(localStorage.getItem('se-projects') || '[]'),
  currentProject: null,
  characterHistory: JSON.parse(localStorage.getItem('se-char-history') || '{}'),

  loadProjects: async () => {
    // Also try loading from server
    try {
      const serverList = await api.listWorkflows();
      // Merge server workflows as projects if not already tracked
      const existing = get().projects;
      const existingIds = new Set(existing.map(p => p.workflowId));
      const newFromServer = (serverList.workflows || [])
        .filter((w: { id: string }) => !existingIds.has(w.id))
        .map((w: { id: string; name: string; updatedAt: string }) => ({
          id: uid(),
          name: w.name,
          description: '',
          createdAt: w.updatedAt,
          updatedAt: w.updatedAt,
          workflowId: w.id,
        }));
      if (newFromServer.length > 0) {
        const merged = [...existing, ...newFromServer];
        localStorage.setItem('se-projects', JSON.stringify(merged));
        set({ projects: merged });
      }
    } catch { /* server may be down */ }
  },

  createProject: async (name, description) => {
    const project: Project = {
      id: uid(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      references: [],
    };
    const projects = [...get().projects, project];
    localStorage.setItem('se-projects', JSON.stringify(projects));
    set({ projects, currentProject: project });
    return project;
  },

  openProject: (id) => {
    const project = get().projects.find(p => p.id === id) || null;
    set({ currentProject: project });
  },

  closeProject: () => set({ currentProject: null }),

  updateProject: (id, data) => {
    const projects = get().projects.map(p =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    localStorage.setItem('se-projects', JSON.stringify(projects));
    const currentProject = get().currentProject?.id === id
      ? projects.find(p => p.id === id) || null
      : get().currentProject;
    set({ projects, currentProject });
  },

  deleteProject: (id) => {
    const projects = get().projects.filter(p => p.id !== id);
    localStorage.setItem('se-projects', JSON.stringify(projects));
    set({ projects, currentProject: get().currentProject?.id === id ? null : get().currentProject });
  },

  saveWorkflowData: (projectId, data) => {
    localStorage.setItem(`se-workflow-${projectId}`, JSON.stringify(data));
  },

  loadWorkflowData: (projectId) => {
    const raw = localStorage.getItem(`se-workflow-${projectId}`);
    if (!raw) return null;
    try { return JSON.parse(raw) as ProjectWorkflowData; }
    catch { return null; }
  },

  deduplicateProjects: () => {
    const seen = new Map<string, Project>();
    for (const p of get().projects) {
      const existing = seen.get(p.name);
      if (!existing || new Date(p.updatedAt) > new Date(existing.updatedAt)) {
        seen.set(p.name, p);
      }
    }
    const deduped = [...seen.values()];
    if (deduped.length < get().projects.length) {
      localStorage.setItem('se-projects', JSON.stringify(deduped));
      set({ projects: deduped });
    }
  },

  addReference: (ref) => {
    const current = get().currentProject;
    if (!current) return;
    const newRef = { ...ref, id: uid() };
    const refs = [...(current.references || []), newRef];
    get().updateProject(current.id, { references: refs });
  },

  removeReference: (id) => {
    const current = get().currentProject;
    if (!current) return;
    const refs = (current.references || []).filter(r => r.id !== id);
    get().updateProject(current.id, { references: refs });
  },

  addCharacterVersion: (name, version) => {
    const history = { ...get().characterHistory };
    const versions = history[name] || [];
    // Deactivate previous active
    const updated = versions.map(v => ({ ...v, isActive: false }));
    updated.push({ ...version, id: uid(), timestamp: new Date().toISOString(), isActive: true });
    history[name] = updated;
    localStorage.setItem('se-char-history', JSON.stringify(history));
    set({ characterHistory: history });
  },

  setActiveCharacterVersion: (name, versionId) => {
    const history = { ...get().characterHistory };
    const versions = (history[name] || []).map(v => ({
      ...v,
      isActive: v.id === versionId,
    }));
    history[name] = versions;
    localStorage.setItem('se-char-history', JSON.stringify(history));
    set({ characterHistory: history });
  },
}));
