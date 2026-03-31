/**
 * Source Assets API — upload, list, and assign real brand assets to scenes.
 * These are REAL files (logos, app screenshots, video clips) that get composited
 * into the AI pipeline, not AI-generated approximations.
 */

import { Router } from 'express';
import multer from 'multer';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type { SourceAsset } from '../services/sourceAssetService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(__dirname, '../../../assets/sources');
const MANIFEST_PATH = join(SOURCE_DIR, 'manifest.json');
mkdirSync(SOURCE_DIR, { recursive: true });

// Load/save manifest
function loadManifest(): SourceAsset[] {
  if (!existsSync(MANIFEST_PATH)) return [];
  try { return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8')); }
  catch { return []; }
}

function saveManifest(assets: SourceAsset[]) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(assets, null, 2));
}

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SOURCE_DIR),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${uuidv4().slice(0, 12)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max

const router = Router();

// List all source assets
router.get('/source-assets', (_req, res) => {
  res.json({ assets: loadManifest() });
});

// Upload a new source asset
router.post('/source-assets', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { label, type, tags, sceneAssignment, compositeMode } = req.body;
  const ext = extname(req.file.filename).toLowerCase();
  const isVideo = ['.mp4', '.mov', '.webm', '.avi'].includes(ext);
  const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext);
  const isAudio = ['.mp3', '.wav', '.aac', '.ogg'].includes(ext);
  const isFont = ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);

  const asset: SourceAsset = {
    id: uuidv4().slice(0, 12),
    type: type || (isVideo ? 'video_clip' : isImage ? 'image' : isAudio ? 'audio' : isFont ? 'font' : 'image'),
    label: label || req.file.originalname,
    filePath: join(SOURCE_DIR, req.file.filename),
    servePath: `/assets/sources/${req.file.filename}`,
    tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags) : [],
    sceneAssignment: sceneAssignment || undefined,
    compositeMode: compositeMode || (isVideo ? 'replace' : 'overlay_phone'),
  };

  const manifest = loadManifest();
  manifest.push(asset);
  saveManifest(manifest);

  res.json({ asset });
});

// Assign asset to a scene
router.patch('/source-assets/:id', (req, res) => {
  const manifest = loadManifest();
  const asset = manifest.find(a => a.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  const { sceneAssignment, compositeMode, compositeParams, tags } = req.body;
  if (sceneAssignment !== undefined) asset.sceneAssignment = sceneAssignment;
  if (compositeMode) asset.compositeMode = compositeMode;
  if (compositeParams) asset.compositeParams = compositeParams;
  if (tags) asset.tags = tags;

  saveManifest(manifest);
  res.json({ asset });
});

// Delete asset
router.delete('/source-assets/:id', (req, res) => {
  let manifest = loadManifest();
  manifest = manifest.filter(a => a.id !== req.params.id);
  saveManifest(manifest);
  res.json({ ok: true });
});

// Get assets assigned to a specific scene
router.get('/source-assets/scene/:sceneId', (req, res) => {
  const manifest = loadManifest();
  const sceneAssets = manifest.filter(a => a.sceneAssignment === req.params.sceneId);
  res.json({ assets: sceneAssets });
});

export default router;
