import { RuntimeAgentDef, RuntimeModelOption, RuntimeBuildOptions, RuntimeContext } from '../types';

// Turki_AI_OS runtime adapter definition
// Production-ready: declares stdin prompt delivery, image support, auth probe, and
// a deterministic buildArgs implementation that respects extraAllowedDirs,
// model selection, and attachments.

export const turkiAgentDef: RuntimeAgentDef = {
  id: 'turki-ai-os',
  name: 'Turki AI OS CLI',
  // The executable name users install: prefer the hyphenated binary
  bin: 'turki-ai-os',
  fallbackBins: ['turki_ai_os', 'turki'],
  versionArgs: ['--version'],
  fallbackModels: [{ id: 'turki-default', label: 'Turki Default' } as RuntimeModelOption],

  // Delivery: large prompts are piped to stdin to avoid CreateProcess limits on Windows
  promptViaStdin: true,
  promptInputFormat: 'stream-json',

  // Turki supports attachments and extra project roots
  supportsImagePaths: true,

  // Auth probe to check whether CLI is logged in / configured
  authProbe: { args: ['auth', 'status'], timeoutMs: 5000 },

  // Reuse an existing structured parser in the daemon: json-event-stream
  streamFormat: 'json-event-stream',

  // Practical buildArgs: pure function, no side effects
  buildArgs: (
    prompt: string,
    imagePaths: string[],
    extraAllowedDirs?: string[],
    options?: RuntimeBuildOptions,
    runtimeContext?: RuntimeContext,
  ) => {
    const args: string[] = ['chat', '--format', 'json', '--non-interactive'];

    // Model selection
    if (options?.model) {
      args.push('--model', options.model);
    }

    // Reasoning or thinking level flags
    if (options?.reasoning) {
      args.push('--reasoning', options.reasoning);
    }

    // Add extra allowed directories (absolute paths) - repeatable flag
    if (extraAllowedDirs && extraAllowedDirs.length) {
      for (const d of extraAllowedDirs) {
        args.push('--add-dir', d);
      }
    }

    // Attach images if present
    if (imagePaths && imagePaths.length) {
      for (const p of imagePaths) {
        args.push('--attachment', p);
      }
    }

    // If runtimeContext contains a sessionId, request resume mode
    if (runtimeContext?.sessionId) {
      args.push('--resume', runtimeContext.sessionId);
    }

    // Turki CLI will read the prompt JSON from stdin when promptViaStdin === true
    return args;
  },

  // Hint: safe high-level prompt arg budget if someone accidentally sets argv mode
  maxPromptArgBytes: 30000,
};
