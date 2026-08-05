import { spawn } from 'child_process';
import * as path from 'path';
import { AGENT_DEFS, getAgentDef } from './runtimes/registry';
import { attachJsonEventParser } from './runtimes/json-event-stream';
import { attachPlainStreamParser } from './runtimes/plain-stream';
import { checkPromptArgvBudget } from './runtimes/prompt-budget';

export type AgentDetectionResult = {
  id: string;
  name?: string;
  available: boolean;
  diagnostics?: string[];
  models?: any[];
  auth?: string | undefined;
};

export async function detectAgents(): Promise<AgentDetectionResult[]> {
  const results: AgentDetectionResult[] = [];

  for (const def of AGENT_DEFS) {
    const r: AgentDetectionResult = { id: def.id, name: def.name, available: false, diagnostics: [] };

    // Basic availability: if bin is the running node executable (tests set this), treat as available
    if (def.bin === process.execPath) {
      r.available = true;
    } else {
      // Try to spawn version probe if provided
      if (def.versionArgs && def.versionArgs.length > 0) {
        try {
          const child = spawn(def.bin, def.versionArgs, { stdio: 'ignore' });
          await new Promise<void>((resolve) => child.once('exit', () => resolve()));
          r.available = true;
        } catch (err: any) {
          r.available = false;
          r.diagnostics!.push(String(err));
        }
      } else {
        // Fallback: mark available if bin exists in PATH by trying to spawn with --version
        try {
          const child = spawn(def.bin, ['--version'], { stdio: 'ignore' });
          await new Promise<void>((resolve) => child.once('exit', () => resolve()));
          r.available = true;
        } catch (err: any) {
          r.available = false;
          r.diagnostics!.push(String(err));
        }
      }
    }

    // Capability discovery (best-effort)
    try {
      if (r.available && def.listModels && def.listModels.listCommandArgs) {
        try {
          const args = def.listModels.listCommandArgs;
          const child = spawn(def.bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
          const out: Buffer[] = [];
          child.stdout?.on('data', (c) => out.push(Buffer.from(c)));
          await new Promise<void>((resolve) => child.once('exit', () => resolve()));
          const txt = Buffer.concat(out).toString().trim();
          try {
            const parsed = JSON.parse(txt);
            r.models = Array.isArray(parsed) ? parsed : (parsed.models || []);
          } catch (e) {
            // try newline-delimited JSON
            const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            const parsed: any[] = [];
            for (const L of lines) {
              try { parsed.push(JSON.parse(L)); } catch (_) {}
            }
            r.models = parsed;
          }
        } catch (e) {
          // ignore capability discovery failures
        }
      }

      if (r.available && def.authProbe && def.authProbe.args) {
        try {
          const args = def.authProbe.args;
          const child = spawn(def.bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
          const out: Buffer[] = [];
          child.stdout?.on('data', (c) => out.push(Buffer.from(c)));
          await new Promise<void>((resolve) => child.once('exit', () => resolve()));
          const txt = Buffer.concat(out).toString().trim();
          r.auth = txt || 'unknown';
        } catch (e) {
          r.auth = 'unknown';
        }
      }
    } catch (e) {
      // swallow discovery errors
    }

    results.push(r);
  }

  return results;
}

export type RunAgentOptions = {
  agentId: string;
  prompt: string;
  imagePaths?: string[];
  onEvent: (ev: any) => void;
  options?: any;
  runtimeContext?: any;
};

export async function runAgent(opts: RunAgentOptions): Promise<any> {
  const def = getAgentDef(opts.agentId);
  if (!def) throw new Error('agent not found: ' + opts.agentId);

  const imagePaths = opts.imagePaths || [];
  const argv = def.buildArgs(opts.prompt, imagePaths, undefined, opts.options, opts.runtimeContext);

  // prompt via stdin if requested
  const spawnOptions: any = { stdio: ['pipe', 'pipe', 'pipe'] };
  const child = spawn(def.bin, argv, spawnOptions);

  // write prompt if def prefers stdin
  if (def.promptViaStdin && child.stdin) {
    try {
      // enforce prompt budget if defined
      if (def.maxPromptArgBytes) checkPromptArgvBudget(Buffer.byteLength(opts.prompt, 'utf8'), def.maxPromptArgBytes);
    } catch (e: any) {
      opts.onEvent({ type: 'error', error: e.message || String(e) });
      child.kill();
      return child;
    }

    try {
      child.stdin.write(opts.prompt);
      child.stdin.end();
    } catch (e) {
      // ignore
    }
  }

  // forward stderr events
  child.stderr?.on('data', (chunk) => {
    const s = chunk.toString();
    opts.onEvent({ type: 'stderr', text: s });
  });

  // Choose parser based on streamFormat
  const fmt = def.streamFormat || 'plain';
  if (fmt === 'json-event-stream') {
    attachJsonEventParser(child, opts.onEvent).catch((err) => opts.onEvent({ type: 'error', error: String(err) }));
  } else if (fmt === 'plain') {
    attachPlainStreamParser(child, opts.onEvent).catch((err) => opts.onEvent({ type: 'error', error: String(err) }));
  } else {
    // fallback: stream raw stdout lines
    child.stdout?.on('data', (chunk) => {
      const s = chunk.toString();
      opts.onEvent({ type: 'stdout', text: s });
    });
  }

  // when child exits, emit exit event
  child.on('exit', (code, signal) => {
    opts.onEvent({ type: 'exit', code, signal });
  });

  return child;
}
