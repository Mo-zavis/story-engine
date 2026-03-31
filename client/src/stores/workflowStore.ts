import { create } from 'zustand';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
} from '@xyflow/react';
import { AnyNodeData, NodeType } from '../types/nodes';
import { api } from '../lib/api';
import { useProjectStore } from './projectStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WorkflowNode = Node<any>;

interface WorkflowStore {
  // Graph state
  nodes: WorkflowNode[];
  edges: Edge[];
  workflowId: string | null;
  workflowName: string;
  selectedNodeId: string | null;

  // Execution state
  isExecuting: boolean;
  executionLog: LogEntry[];

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<AnyNodeData>) => void;
  selectNode: (id: string | null) => void;
  deleteNode: (id: string) => void;

  // Workflow persistence
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  loadTemplate: (nodes: WorkflowNode[], edges: Edge[], name: string) => void;
  newWorkflow: () => void;
  setWorkflowName: (name: string) => void;

  // Execution
  executeNode: (nodeId: string) => Promise<void>;
  executeAll: () => Promise<void>;
  executeNodeSet: (nodeIds: string[]) => Promise<void>;
  addLogEntry: (entry: LogEntry) => void;
  clearLog: () => void;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'error' | 'warn';
  nodeId?: string;
  nodeLabel?: string;
  message: string;
}

let nodeCounter = 0;

function createDefaultNodeData(type: NodeType): AnyNodeData {
  const base = { label: '', status: 'idle' as const, outputs: {} };
  switch (type) {
    case 'storyConcept':
      return { ...base, type, label: 'Story Concept', concept: '', genre: 'Drama', tone: 'Inspirational', targetDuration: 60 };
    case 'character':
      return { ...base, type, label: 'Character Design', characterName: '', description: '', style: 'cinematic photorealistic' };
    case 'storyboard':
      return { ...base, type, label: 'Storyboard' };
    case 'frameGenerator':
      return { ...base, type, label: 'Frame Generator', sceneId: '', imagePrompt: '', style: 'cinematic', aspectRatio: '9:16' };
    case 'animation':
      return { ...base, type, label: 'Animation', motionPreset: 'ken_burns', durationSeconds: 5 };
    case 'voiceover':
      return { ...base, type, label: 'Voiceover', script: '', narratorProfile: 'storyteller' };
    case 'sfx':
      return { ...base, type, label: 'Scene Audio', sceneLabel: '', ambientPrompt: '', foleyPrompt: '', transitionSound: '', prelapMs: 300 };
    case 'music':
      return { ...base, type, label: 'Background Music', mood: 'emotional', genre: 'cinematic' };
    case 'compile':
      return { ...base, type, label: 'Compile Video', title: 'My Story', scenes: [] };
    case 'export':
      return { ...base, type, label: 'Export for Instagram', platform: 'instagram_reel' };
  }
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  workflowId: null,
  workflowName: 'Untitled Story',
  selectedNodeId: null,
  isExecuting: false,
  executionLog: [],

  onNodesChange: (changes) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes as any) as WorkflowNode[] })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set((state) => ({ edges: addEdge({ ...connection, animated: true }, state.edges) })),

  addNode: (type, position) => {
    nodeCounter++;
    const id = `${type}-${nodeCounter}`;
    const newNode: WorkflowNode = {
      id,
      type,
      position,
      data: createDefaultNodeData(type),
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as AnyNodeData } : n
      ),
    })),

  selectNode: (id) => set({ selectedNodeId: id }),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  saveWorkflow: async () => {
    const { nodes, edges, workflowId, workflowName } = get();
    try {
      const result = await api.saveWorkflow({ id: workflowId, name: workflowName, nodes, edges });
      set({ workflowId: result.id });
    } catch (e) {
      console.error('Failed to save workflow', e);
    }
  },

  loadWorkflow: async (id) => {
    try {
      const wf = await api.loadWorkflow(id);
      set({ nodes: wf.nodes, edges: wf.edges, workflowId: wf.id, workflowName: wf.name });
    } catch (e) {
      console.error('Failed to load workflow', e);
    }
  },

  loadTemplate: (nodes, edges, name) => {
    set({ nodes, edges, workflowId: null, workflowName: name, selectedNodeId: null, executionLog: [] });
    // Auto-save to current project
    const projectId = useProjectStore.getState().currentProject?.id;
    if (projectId) {
      useProjectStore.getState().saveWorkflowData(projectId, { nodes, edges });
    }
  },

  newWorkflow: () =>
    set({ nodes: [], edges: [], workflowId: null, workflowName: 'Untitled Story', selectedNodeId: null, executionLog: [] }),

  setWorkflowName: (name) => set({ workflowName: name }),

  executeNode: async (nodeId) => {
    const { nodes, edges, updateNodeData, addLogEntry } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Gather inputs from connected nodes
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    const inputData: Record<string, unknown> = {};
    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode?.data.outputs && edge.sourceHandle) {
        inputData[edge.targetHandle || edge.sourceHandle] = (sourceNode.data.outputs as Record<string, unknown>)[edge.sourceHandle];
      }
    }

    // Per-scene routing: if this node has a sceneIndex and receives a storyboard (array of scenes),
    // extract the specific scene and pass it as storyboardScene for downstream auto-fill
    const sceneIndex = node.data.sceneIndex as number | undefined;
    const storyboardData = inputData.storyboard as { scenes?: unknown[] } | undefined;
    if (storyboardData?.scenes && sceneIndex !== undefined && sceneIndex < storyboardData.scenes.length) {
      inputData.storyboardScene = storyboardData.scenes[sceneIndex];
    } else if (storyboardData?.scenes && storyboardData.scenes.length > 0) {
      // Fallback: try to infer scene index from node position among siblings of same type
      const sameTypeNodes = nodes
        .filter(n => n.type === node.type)
        .sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));
      const inferredIdx = sameTypeNodes.findIndex(n => n.id === nodeId);
      if (inferredIdx >= 0 && inferredIdx < storyboardData.scenes.length) {
        inputData.storyboardScene = storyboardData.scenes[inferredIdx];
      }
    }

    // Scene continuity: for animation nodes, find the NEXT animation node's
    // connected frame generator and pass its CDN URL as last_frame target
    if (node.type === 'animation') {
      const compileEdges = edges.filter(e => e.source === nodeId && e.sourceHandle === 'video');
      for (const ce of compileEdges) {
        // Find sibling animation nodes feeding the same compile node
        const siblingAnimEdges = edges.filter(e => e.target === ce.target && e.targetHandle === 'videos' && e.source !== nodeId);
        // Get all animation nodes feeding this compile, sorted by their connected frame's sceneId
        const allAnimIds = [nodeId, ...siblingAnimEdges.map(e => e.source)];
        const animNodes = allAnimIds
          .map(id => nodes.find(n => n.id === id))
          .filter(Boolean)
          .sort((a, b) => {
            const aIdx = nodes.indexOf(a!);
            const bIdx = nodes.indexOf(b!);
            return aIdx - bIdx;
          });
        const myIdx = animNodes.findIndex(n => n!.id === nodeId);
        const nextAnim = animNodes[myIdx + 1];
        if (nextAnim) {
          // Find the frame generator connected to the next animation node
          const nextAnimInputEdge = edges.find(e => e.target === nextAnim.id && e.targetHandle === 'image');
          if (nextAnimInputEdge) {
            const nextFrameNode = nodes.find(n => n.id === nextAnimInputEdge.source);
            const nextCdn = (nextFrameNode?.data.outputs as Record<string, unknown>)?.imageCdnUrl as string;
            if (nextCdn) {
              inputData.nextSceneCdnUrl = nextCdn;
            }
          }
        }
      }
    }

    updateNodeData(nodeId, { status: 'running', error: undefined });
    addLogEntry({
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      level: 'info',
      nodeId,
      nodeLabel: node.data.label,
      message: `Executing ${node.data.label}...`,
    });

    try {
      const projectState = useProjectStore.getState();
      const refs = projectState.currentProject?.references || [];
      const result = await api.executeNode(nodeId, node.type as NodeType, node.data, inputData, refs);
      updateNodeData(nodeId, { status: 'done', outputs: result.outputs, ...result.dataUpdates });
      // Auto-save workflow to project after each node completes
      const pid = projectState.currentProject?.id;
      if (pid) {
        const { nodes: n, edges: e } = get();
        projectState.saveWorkflowData(pid, { nodes: n, edges: e });
      }
      addLogEntry({
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        level: 'success',
        nodeId,
        nodeLabel: node.data.label,
        message: `${node.data.label} completed successfully`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      updateNodeData(nodeId, { status: 'error', error: errorMsg });
      addLogEntry({
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        level: 'error',
        nodeId,
        nodeLabel: node.data.label,
        message: `${node.data.label} failed: ${errorMsg}`,
      });
    }
  },

  executeAll: async () => {
    const { nodes, edges, executeNode } = get();
    set({ isExecuting: true });

    // Topological sort
    const order = topologicalSort(nodes.map((n) => n.id), edges);

    for (const nodeId of order) {
      await executeNode(nodeId);
      // Check if node failed
      const node = get().nodes.find((n) => n.id === nodeId);
      if (node?.data.status === 'error') break;
    }

    set({ isExecuting: false });
  },

  executeNodeSet: async (nodeIds) => {
    const { edges, executeNode } = get();
    set({ isExecuting: true });
    const order = topologicalSort(nodeIds, edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target)));
    for (const nodeId of order) {
      await executeNode(nodeId);
      const node = get().nodes.find((n) => n.id === nodeId);
      if (node?.data.status === 'error') break;
    }
    set({ isExecuting: false });
  },

  addLogEntry: (entry) =>
    set((state) => ({ executionLog: [...state.executionLog.slice(-199), entry] })),

  clearLog: () => set({ executionLog: [] }),
}));

function topologicalSort(nodeIds: string[], edges: Edge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  for (const id of nodeIds) {
    inDegree[id] = 0;
    adj[id] = [];
  }

  for (const edge of edges) {
    if (adj[edge.source]) adj[edge.source].push(edge.target);
    if (inDegree[edge.target] !== undefined) inDegree[edge.target]++;
  }

  const queue = nodeIds.filter((id) => inDegree[id] === 0);
  const result: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const neighbor of adj[node] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return result;
}
