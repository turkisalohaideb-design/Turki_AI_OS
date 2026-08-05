import { spawn, SpawnOptions, ChildProcess } from 'child_process';
import * as stream from 'stream';
import { AGENT_DEFS, getAgentDef } from './runtimes/registry';
import { checkPromptArgvBudget, checkWindowsCmdShimCommandLineBudget, checkWindowsDirectExeCommandLineBudget } from './runtimes/prompt-budget';

// Parsers
import * as jsonEventParser from './runtimes/json-event-stream';
import * as plainStreamParser from './runtimes/plain-stream';

const PARSER_MAP: Record<string, (proc: ChildProcess, onEvent: (ev: any) => void) => Promise<void>> = {
  'json-event-stream': jsonEventParser.attachJsonEventParser,
  'plain': plainStreamParser.attachPlainStreamParser,
};

export type AgentDetectionResult = {
  id: string;
  available: boolean;
  path?: string;
  version?: string;
  diagnostics?: string[];
};

// Detect agents by running their version probe. This is a best-effort, per-def fault-isolated probe.
export async function detectAgents(): Promise<AgentDetectionResult[]> {
  const results: AgentDetectionResult[] = [];

  await Promise.all(
    AGENT_DEFS.map(async (def) => {
      const res: AgentDetectionResult = { id: def.id, available: false };
      try {
        // spawn sync version probe to get quick availability
        const child = spawn(def.bin, def.versionArgs || ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
        let stdout = '';
        if (child.stdout) {
          child.stdout.on('data', (b) => (stdout += b.toString()));
        }
        await new Promise((resolve) => child.once('close', resolve));
        if (stdout.trim()) {
          res.available = true;
          res.version = stdout.trim().split('\n')[0];
          res.path = def.bin;
        } else {
          // binary ran but produced no version output — still available
          res.available = true;
          res.path = def.bin;
        }
      } catch (err: any) {
        res.available = false;
        res.diagnostics = [err?.message || String(err)];
      }
      results.push(res);
    }),
  );

  return results;
}

export type RunOptions = {
  agentId: string;
  prompt: string;
  imagePaths?: string[];
  extraAllowedDirs?: string[];
  options?: any;
  runtimeContext?: any;
  onEvent?: (ev: any) => void;
};

// Runs an agent defined by agentId. Returns the child process. Events will be emitted via onEvent.
export async function runAgent(opts: RunOptions): Promise<ChildProcess> {
  const def = getAgentDef(opts.agentId);
  if (!def) throw new Error(`Unknown agent id: ${opts.agentId}`);

  // Validate prompt budget when the def does not accept stdin
  const promptBytes = Buffer.byteLength(opts.prompt || '', 'utf8');
  if (!def.promptViaStdin) {
    // Fast pre-resolution check
    checkPromptArgvBudget(promptBytes, def.maxPromptArgBytes);

    // For Windows specific guards we'd need to know the resolved binary path and shim/direct detail.
    // Here we conservatively build a command line and check both guards to be safe.
    const simulatedCmd = `${def.bin} ${def.buildArgs(opts.prompt || '', opts.imagePaths || [], opts.extraAllowedDirs || [], opts.options || {}, opts.runtimeContext || {})
      .map((a) => (a.includes(' ') ? `"${a}"` : a))
      .join(' ')}`;

    try {
      checkWindowsCmdShimCommandLineBudget(simulatedCmd);
    } catch (e) {
      // try direct-exe guard too; if either throws, bubble the error
      checkWindowsDirectExeCommandLineBudget(simulatedCmd);
    }
  }

  const argv = def.buildArgs(opts.prompt || '', opts.imagePaths || [], opts.extraAllowedDirs || [], opts.options || {}, opts.runtimeContext || {});

  const spawnOptions: SpawnOptions = { cwd: opts.runtimeContext?.cwd || process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] };

  const child = spawn(def.bin, argv, spawnOptions);

  // If promptViaStdin, write the composed prompt to stdin
  if (def.promptViaStdin) {
    if (child.stdin) {
      child.stdin.write(opts.prompt || '');
      // For 'stream-json' keep stdin open — the def indicates whether it's stream-json and the engine will close when run ends
      if (def.promptInputFormat !== 'stream-json') child.stdin.end();
    }
  }

  // Route stdout/stderr through the parser selected by streamFormat
  const parser = PARSER_MAP[def.streamFormat];
  const onEvent = opts.onEvent || (() => undefined);

  if (parser) {
    parser(child, onEvent).catch((err) => {
      onEvent({ type: 'error', error: err?.message || String(err) });
    });
  } else {
    // Fallback: forward raw stdout as text-delta events
    let buf = '';
    if (child.stdout) {
      child.stdout.on('data', (b) => {
        buf += b.toString();
        onEvent({ type: 'assistant.delta', text: b.toString() });
      });
      child.stdout.on('end', () => {
        onEvent({ type: 'done', text: buf });
      });
    }
  }

  if (child.stderr) {
    child.stderr.on('data', (b) => onEvent({ type: 'stderr', text: b.toString() }));
  }

  child.on('error', (err) => onEvent({ type: 'error', error: err?.message || String(err) }));
  child.on('exit', (code, signal) => onEvent({ type: 'exit', code, signal }));

  return child;
}
