import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, copyFileSync, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../../assets/outputs');

// FFmpeg zoompan filters for the full motion vocabulary.
// These are the LOCAL FALLBACK when Kling/Freepik API isn't available.
// The primary path uses Kling O1 with natural language prompts (in execute.ts).
const FFMPEG_FILTERS: Record<string, string> = {
  // Static
  static: "zoompan=z='1':d=150:fps=30",

  // Dolly / push / pull
  push_in: "zoompan=z='min(zoom+0.002,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:fps=30",
  pull_out: "zoompan=z='if(eq(on,1),1.5,max(zoom-0.002,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:fps=30",

  // Pan
  pan_left: "zoompan=z='1.3':x='if(gte(on,1),max(x-2,0),iw)':y='ih/2-(ih/zoom/2)':d=150:fps=30",
  pan_right: "zoompan=z='1.3':x='if(gte(on,1),min(x+2,iw),0)':y='ih/2-(ih/zoom/2)':d=150:fps=30",
  tilt_up: "zoompan=z='1.3':x='iw/2-(iw/zoom/2)':y='if(gte(on,1),max(y-2,0),ih)':d=150:fps=30",
  tilt_down: "zoompan=z='1.3':x='iw/2-(iw/zoom/2)':y='if(gte(on,1),min(y+2,ih),0)':d=150:fps=30",

  // Zoom
  zoom_in_slow: "zoompan=z='min(zoom+0.001,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:fps=30",
  zoom_out_slow: "zoompan=z='if(eq(on,1),1.3,max(zoom-0.001,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:fps=30",
  snap_zoom: "zoompan=z='if(lt(on,30),1+on*0.02,1.6)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:fps=30",

  // Atmospheric
  drift_up: "zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='if(gte(on,1),max(y-0.5,0),ih*0.3)':d=150:fps=30",
  drift_down: "zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='if(gte(on,1),min(y+0.5,ih),0)':d=150:fps=30",
  drift_lateral: "zoompan=z='1.1':x='iw/2-(iw/zoom/2)+8*sin(on/30)':y='ih/2-(ih/zoom/2)':d=150:fps=30",
  pulse: "zoompan=z='1+0.04*sin(on/18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:fps=30",
  ken_burns: "zoompan=z='min(zoom+0.0015,1.4)':x='if(gte(on,1),min(x+1,iw),0)':y='ih/2-(ih/zoom/2)':d=150:fps=30",

  // Crane
  crane_up: "zoompan=z='if(eq(on,1),1.5,max(zoom-0.002,1))':x='iw/2-(iw/zoom/2)':y='if(gte(on,1),max(y-2,0),ih)':d=150:fps=30",
  crane_down: "zoompan=z='min(zoom+0.002,1.5)':x='iw/2-(iw/zoom/2)':y='if(gte(on,1),min(y+2,ih),0)':d=150:fps=30",

  // UGC defaults to handheld
  handheld: "zoompan=z='1+0.01*sin(on/5)':x='iw/2-(iw/zoom/2)+3*sin(on/7)':y='ih/2-(ih/zoom/2)+3*cos(on/9)':d=150:fps=30",
  handheld_walk: "zoompan=z='1+0.01*sin(on/5)':x='iw/2-(iw/zoom/2)+4*sin(on/7)':y='ih/2-(ih/zoom/2)+6*abs(sin(on/4))':d=150:fps=30",
  selfie_handheld: "zoompan=z='1+0.02*sin(on/8)':x='iw/2-(iw/zoom/2)+5*sin(on/6)':y='ih/2-(ih/zoom/2)+4*cos(on/10)':d=150:fps=30",
};

export async function animateFrame(
  imageLocalPath: string,
  motionPreset: string,
  durationSeconds: number
): Promise<{ videoUrl: string; localPath: string }> {
  return animateWithFFmpeg(imageLocalPath, motionPreset, durationSeconds);
}

async function animateWithFFmpeg(
  imageLocalPath: string,
  preset: string,
  durationSeconds: number
): Promise<{ videoUrl: string; localPath: string }> {
  if (!existsSync(imageLocalPath)) {
    throw new Error(`Source image not found: ${imageLocalPath}`);
  }

  const filename = `anim_${uuidv4().slice(0, 8)}.mp4`;
  const subdir = join(ASSETS_DIR, 'animations');
  mkdirSync(subdir, { recursive: true });
  const outputPath = join(subdir, filename);

  const filter = FFMPEG_FILTERS[preset] || FFMPEG_FILTERS.ken_burns;

  // Generate video from still image with motion effect
  const cmd = [
    'ffmpeg',
    '-y',
    `-loop 1 -i "${imageLocalPath}"`,
    `-vf "${filter},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"`,
    '-c:v libx264',
    '-t', String(durationSeconds),
    '-pix_fmt yuv420p',
    '-r 30',
    `"${outputPath}"`,
  ].join(' ');

  try {
    await execAsync(cmd, { timeout: 120000 });
  } catch (err) {
    // FFmpeg not available — create a static "video" reference (just copy image path as placeholder)
    console.warn('FFmpeg not available, using placeholder animation reference');
    // Return the image URL as a "video" — the compile step handles this gracefully
    return {
      videoUrl: `/assets/outputs/frames/${imageLocalPath.split('/').pop()}`,
      localPath: imageLocalPath,
    };
  }

  return {
    videoUrl: `/assets/outputs/animations/${filename}`,
    localPath: outputPath,
  };
}

async function generateWithVeo(
  imageLocalPath: string,
  durationSeconds: number
): Promise<{ videoUrl: string; localPath: string }> {
  // Google Veo API integration
  // This uses the Vertex AI endpoint for Veo 2
  const apiKey = process.env.GOOGLE_VEO_API_KEY;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;

  if (!apiKey || !projectId) {
    throw new Error('GOOGLE_VEO_API_KEY and GOOGLE_CLOUD_PROJECT required for Veo generation');
  }

  // Placeholder for Veo integration — the API is in preview
  // When Veo API becomes GA, this would:
  // 1. Upload image to GCS
  // 2. Call Veo generateVideo with image conditioning
  // 3. Poll for completion
  // 4. Download result
  throw new Error('Veo API integration is in preview — please use a motion preset for now');
}

export function selectMusicTrack(mood: string, genre: string): string {
  // Return path to royalty-free music track based on mood/genre
  // These are placeholder paths — real implementation would have actual audio files
  const trackMap: Record<string, string> = {
    'emotional-cinematic': '/assets/music/emotional_piano.mp3',
    'uplifting-cinematic': '/assets/music/cinematic_build.mp3',
    'peaceful-ambient': '/assets/music/ambient_pad.mp3',
    'tense-cinematic': '/assets/music/tension_strings.mp3',
    'epic-cinematic': '/assets/music/epic_strings.mp3',
  };

  const key = `${mood}-${genre}`;
  return trackMap[key] || trackMap['emotional-cinematic'];
}
