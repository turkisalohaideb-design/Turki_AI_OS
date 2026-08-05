export type RuntimeModelOption = { id: string; label: string };

export type RuntimeBuildOptions = {
  model?: string;
  reasoning?: string;
};

export type RuntimeContext = {
  cwd?: string;
  sessionId?: string;
};

export type AuthProbe = { args: string[]; timeoutMs?: number };

export type RuntimeAgentDef = {
  id: string;
  name: string;
  bin: string;
  fallbackBins?: string[];
  versionArgs: string[];
  fallbackModels?: RuntimeModelOption[];

  buildArgs: (
    prompt: string,
    imagePaths: string[],
    extraAllowedDirs?: string[],
    options?: RuntimeBuildOptions,
    runtimeContext?: RuntimeContext,
  ) => string[];

  streamFormat: string;
  eventParser?: string;
  promptViaStdin?: boolean;
  promptViaFile?: boolean;
  promptInputFormat?: 'text' | 'stream-json';
  supportsImagePaths?: boolean;
  externalMcpInjection?: string;
  authProbe?: AuthProbe;
  listModels?: {
    listCommandArgs: string[];
  };

  // Optional: limit on argv prompt bytes for Windows CreateProcess guards
  maxPromptArgBytes?: number;
};
