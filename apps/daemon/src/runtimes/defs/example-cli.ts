import { RuntimeAgentDef, RuntimeModelOption, RuntimeBuildOptions, RuntimeContext } from '../types';

// RuntimeAgentDef template for adding a new CLI-backed adapter.
// - Use this file as a copy/paste starting point and fill the fields.
// - Keep buildArgs pure and avoid side effects. Prefer promptViaStdin when prompt is large.

export const exampleAgentDef: RuntimeAgentDef = {
  id: 'example-cli',
  name: 'Example CLI',
  bin: 'example-cli',
  fallbackBins: ['example'],
  versionArgs: ['--version'],
  fallbackModels: [{ id: 'example-default', label: 'Example Default' } as RuntimeModelOption],

  // Choose a streamFormat that already exists if possible to avoid adding a new parser.
  streamFormat: 'json-event-stream',

  // The composed prompt will be piped to stdin rather than placed on argv.
  promptViaStdin: true,
  promptInputFormat: 'stream-json',

  supportsImagePaths: true,
  authProbe: { args: ['auth', 'status'], timeoutMs: 5000 },

  // Build the argv for a run. Keep this function deterministic and side-effect free.
  buildArgs: (
    prompt: string,
    imagePaths: string[],
    extraAllowedDirs?: string[],
    options?: RuntimeBuildOptions,
    runtimeContext?: RuntimeContext,
  ) => {
    const args: string[] = ['run', '--format', 'json'];

    if (options?.model) {
      args.push('--model', options.model);
    }

    if (extraAllowedDirs?.length) {
      for (const d of extraAllowedDirs) args.push('--add-dir', d);
    }

    // Images: pass absolute attachments when supported
    if (imagePaths?.length) {
      for (const p of imagePaths) args.push('--attachment', p);
    }

    return args;
  },
};
