import { createWriteStream, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../../assets/outputs/voiceovers');
mkdirSync(ASSETS_DIR, { recursive: true });

const NARRATOR_PROFILES: Record<string, { voiceId: string; settings: Record<string, unknown> }> = {
  // Punchy staccato authority — clean declarative sports-doc delivery
  authority: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
    settings: { stability: 0.45, similarity_boost: 0.82, style: 0.4, use_speaker_boost: true },
  },
  // Warm intimate — conversational intimacy for close-up moments
  storyteller: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    settings: { stability: 0.38, similarity_boost: 0.78, style: 0.5, use_speaker_boost: true },
  },
  // Natural pace — everyday conversation energy
  conversational: {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni
    settings: { stability: 0.4, similarity_boost: 0.75, style: 0.45, use_speaker_boost: true },
  },
  // Deep gravitas — for weight-bearing moments only (not whole episode)
  documentary: {
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold
    settings: { stability: 0.35, similarity_boost: 0.82, style: 0.55, use_speaker_boost: true },
  },
  // High expression — for climax and reveal moments
  dramatic: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    settings: { stability: 0.28, similarity_boost: 0.82, style: 0.65, use_speaker_boost: true },
  },
  // Sports-doc soul — warm, rhythmic, contemporary. Primary narrator for Underdog series
  sports_doc: {
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel — warm British narrator
    settings: { stability: 0.25, similarity_boost: 0.88, style: 0.70, speed: 0.88, use_speaker_boost: true },
  },
};

export async function generateVoiceover(
  text: string,
  narratorProfile: string
): Promise<{ audioUrl: string; durationSeconds: number }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not set');

  const profile = NARRATOR_PROFILES[narratorProfile] || NARRATOR_PROFILES.storyteller;

  const body = JSON.stringify({
    text,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: profile.settings,
  });

  const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${profile.voiceId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`ElevenLabs error: ${res.statusCode}`));
        } else {
          resolve(Buffer.concat(chunks));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });

  const filename = `vo_${uuidv4().slice(0, 8)}.mp3`;
  const localPath = join(ASSETS_DIR, filename);
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(localPath);
    ws.write(audioBuffer, (err) => {
      if (err) reject(err);
      ws.end(() => resolve());
    });
  });

  // Estimate duration: ~150 words per minute
  const wordCount = text.split(/\s+/).length;
  const durationSeconds = (wordCount / 150) * 60;

  return {
    audioUrl: `/assets/outputs/voiceovers/${filename}`,
    durationSeconds,
  };
}
