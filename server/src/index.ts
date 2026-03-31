import dotenv from 'dotenv';
import { resolve, dirname as dn } from 'path';
import { fileURLToPath as fu } from 'url';
dotenv.config({ path: resolve(dn(fu(import.meta.url)), '../../.env') });
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

import executeRouter from './routes/execute.js';
import workflowsRouter from './routes/workflows.js';
import skillsRouter from './routes/skills.js';
import sourceAssetsRouter from './routes/sourceAssets.js';
import { isClaudeCliAvailable } from './services/claudeCliService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../assets/outputs');
const MUSIC_DIR = join(__dirname, '../../assets/music');
mkdirSync(ASSETS_DIR, { recursive: true });
mkdirSync(MUSIC_DIR, { recursive: true });

const PORT = parseInt(process.env.PORT || '3420');
const MEDIA_PIPELINE_URL = process.env.MEDIA_PIPELINE_URL || 'http://localhost:9004';

const app = express();
const httpServer = createServer(app);

// WebSocket server for real-time job progress
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

export function broadcast(event: string, data: unknown) {
  const msg = JSON.stringify({ event, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// Middleware
app.use(cors({ origin: ['http://localhost:3421', 'http://127.0.0.1:3421'] }));
app.use(express.json({ limit: '50mb' }));

// Serve generated assets
app.use('/assets/outputs', express.static(ASSETS_DIR));
app.use('/assets/music', express.static(MUSIC_DIR));

// Proxy to media-pipeline assets (for compiled videos from the pipeline)
app.use('/proxy/media', async (req, res) => {
  try {
    const targetUrl = `${MEDIA_PIPELINE_URL}${req.path}`;
    const response = await fetch(targetUrl);
    if (!response.ok) return res.status(response.status).send('Not found');

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch {
    res.status(502).send('Media pipeline unavailable');
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'story-engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mediaPipelineUrl: MEDIA_PIPELINE_URL,
    hasFreepik: !!process.env.FREEPIK_API_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    hasElevenLabs: !!process.env.ELEVENLABS_API_KEY,
    hasVeo: !!process.env.GOOGLE_VEO_API_KEY,
  });
});

// API routes
app.use('/api', executeRouter);
app.use('/api', workflowsRouter);
app.use('/api', skillsRouter);
app.use('/api', sourceAssetsRouter);

// Serve source assets (brand logos, real footage, screenshots)
const SOURCE_DIR = join(__dirname, '../../assets/sources');
mkdirSync(SOURCE_DIR, { recursive: true });
app.use('/assets/sources', express.static(SOURCE_DIR));

// Music library listing
app.get('/api/music', (_req, res) => {
  res.json({
    tracks: [
      { id: 'emotional_piano', label: 'Emotional Piano', url: '/assets/music/emotional_piano.mp3', mood: 'emotional', duration: 120 },
      { id: 'cinematic_build', label: 'Cinematic Build', url: '/assets/music/cinematic_build.mp3', mood: 'uplifting', duration: 90 },
      { id: 'ambient_pad', label: 'Ambient Pad', url: '/assets/music/ambient_pad.mp3', mood: 'peaceful', duration: 180 },
      { id: 'epic_strings', label: 'Epic Strings', url: '/assets/music/epic_strings.mp3', mood: 'epic', duration: 75 },
      { id: 'tension_strings', label: 'Tension Strings', url: '/assets/music/tension_strings.mp3', mood: 'tense', duration: 60 },
    ],
  });
});

httpServer.listen(PORT, () => {
  console.log(`\n🎬 Story Engine API running at http://localhost:${PORT}`);
  console.log(`   Frontend:     http://localhost:3421`);
  console.log(`   WebSocket:    ws://localhost:${PORT}/ws`);
  console.log(`   Assets:       http://localhost:${PORT}/assets/outputs`);
  console.log(`   Media pipe:   ${MEDIA_PIPELINE_URL}`);
  console.log(`\n   AI services:`);
  console.log(`   Freepik:      ${process.env.FREEPIK_API_KEY ? '✓ configured (images, video, music, SFX)' : '✗ FREEPIK_API_KEY missing'}`);
  console.log(`   OpenAI:       ${process.env.OPENAI_API_KEY ? '✓ configured' : '— fallback (needs FREEPIK or OPENAI)'}`);
  const cliOk = isClaudeCliAvailable();
  console.log(`   Claude CLI:   ${cliOk ? '✓ available (story + storyboard via subscription)' : '✗ not found'}`);
  console.log(`   Anthropic:    ${process.env.ANTHROPIC_API_KEY ? '✓ API key configured' : cliOk ? '— not needed (using CLI)' : '✗ ANTHROPIC_API_KEY missing'}`);
  console.log(`   ElevenLabs:   ${process.env.ELEVENLABS_API_KEY ? '✓ configured' : '— fallback for voiceover'}`);
  console.log(`   Google Veo:   ${process.env.GOOGLE_VEO_API_KEY ? '✓ configured' : '— optional'}`);
  console.log();
});
