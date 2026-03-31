import { NodeType, AnyNodeData } from '../types/nodes';

const BASE = '/api';

export const api = {
  // ── Workflow CRUD ──────────────────────────────────────────────────────────
  async saveWorkflow(data: { id: string | null; name: string; nodes: unknown[]; edges: unknown[] }) {
    const res = await fetch(`${BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async loadWorkflow(id: string) {
    const res = await fetch(`${BASE}/workflows/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async listWorkflows() {
    const res = await fetch(`${BASE}/workflows`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteWorkflow(id: string) {
    const res = await fetch(`${BASE}/workflows/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Node Execution ─────────────────────────────────────────────────────────
  async executeNode(
    nodeId: string,
    nodeType: NodeType,
    nodeData: AnyNodeData,
    inputData: Record<string, unknown>,
    references?: Array<{ type: string; label: string; url: string; notes?: string }>
  ) {
    const res = await fetch(`${BASE}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, nodeType, nodeData, inputData, references }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    return res.json() as Promise<{ outputs: Record<string, unknown>; dataUpdates: Partial<AnyNodeData> }>;
  },

  // ── Job Status ─────────────────────────────────────────────────────────────
  async getJobStatus(jobId: string) {
    const res = await fetch(`${BASE}/jobs/${jobId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Music Library ──────────────────────────────────────────────────────────
  async getMusicTracks() {
    const res = await fetch(`${BASE}/music`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
