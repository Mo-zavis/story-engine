/**
 * Claude CLI Service — uses `claude --print -p` subprocess
 * instead of the Anthropic API SDK. Uses your Claude subscription
 * directly, no API key needed.
 */

import { spawn, execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CWD = resolve(__dirname, '../../..');

export function isClaudeCliAvailable(): boolean {
  try {
    execSync('which claude', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export async function runClaude(
  prompt: string,
  opts: { timeout?: number; allowedTools?: string[] } = {}
): Promise<{ success: boolean; output: string; error: string }> {
  const timeout = opts.timeout || 5 * 60 * 1000;

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let resolved = false;

    const args = ['--print', '-p', prompt];

    if (opts.allowedTools) {
      for (const tool of opts.allowedTools) {
        args.push('--allowedTools', tool);
      }
    }

    const proc = spawn('claude', args, {
      cwd: CWD,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.kill('SIGTERM');
        resolve({ success: false, output: stdout, error: `Timeout after ${timeout / 1000}s` });
      }
    }, timeout);

    proc.on('close', (code: number | null) => {
      clearTimeout(timer);
      if (!resolved) {
        resolved = true;
        resolve({
          success: code === 0,
          output: stdout,
          error: code !== 0 ? (stderr || `Exit code ${code}`) : '',
        });
      }
    });

    proc.on('error', (err: Error) => {
      clearTimeout(timer);
      if (!resolved) {
        resolved = true;
        resolve({ success: false, output: '', error: `Failed to spawn claude: ${err.message}` });
      }
    });
  });
}

/**
 * Run Claude CLI with production skill context injected into the prompt.
 * Skills are loaded from server/skills/ and prepended based on pipeline stage.
 */
export async function runClaudeWithSkills(
  prompt: string,
  stage: string,
  opts: { timeout?: number; allowedTools?: string[] } = {}
): Promise<{ success: boolean; output: string; error: string }> {
  // Dynamic import to avoid circular deps at module load time
  const { getSkillsForStage } = await import('./skillService.js');
  const skillContext = getSkillsForStage(stage);
  const enrichedPrompt = skillContext
    ? `${skillContext}\n=== TASK ===\n${prompt}`
    : prompt;

  console.log(`  [claudeCli] Running with ${stage} skills (${skillContext ? skillContext.split('SKILL:').length - 1 : 0} loaded)`);
  return runClaude(enrichedPrompt, opts);
}

export function extractJson<T = unknown>(output: string): T | null {
  if (!output) return null;

  // Try code block first
  const codeBlockMatch = output.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1]) as T; } catch { /* fall through */ }
  }

  // Try raw JSON
  const jsonMatch = output.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]) as T; } catch { /* fall through */ }
  }

  return null;
}
