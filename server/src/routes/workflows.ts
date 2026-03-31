import { Router } from 'express';
import { db } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// List workflows
router.get('/workflows', (_req, res) => {
  const rows = db.prepare('SELECT id, name, created_at, updated_at FROM workflows ORDER BY updated_at DESC LIMIT 50').all();
  res.json({ workflows: rows });
});

// Get single workflow
router.get('/workflows/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id) as Record<string, string> | undefined;
  if (!row) return res.status(404).json({ error: 'Workflow not found' });
  res.json({
    id: row.id,
    name: row.name,
    nodes: JSON.parse(row.nodes),
    edges: JSON.parse(row.edges),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
});

// Create or update workflow
router.post('/workflows', (req, res) => {
  const { id, name, nodes, edges } = req.body;
  const workflowId = id || uuidv4().slice(0, 12);
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM workflows WHERE id = ?').get(workflowId);

  if (existing) {
    db.prepare(
      'UPDATE workflows SET name = ?, nodes = ?, edges = ?, updated_at = ? WHERE id = ?'
    ).run(name, JSON.stringify(nodes), JSON.stringify(edges), now, workflowId);
  } else {
    db.prepare(
      'INSERT INTO workflows (id, name, nodes, edges, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(workflowId, name || 'Untitled', JSON.stringify(nodes), JSON.stringify(edges), now, now);
  }

  res.json({ id: workflowId, name, updatedAt: now });
});

// Delete workflow
router.delete('/workflows/:id', (req, res) => {
  db.prepare('DELETE FROM workflows WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
