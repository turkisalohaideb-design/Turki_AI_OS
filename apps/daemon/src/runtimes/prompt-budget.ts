/***********************
 * Prompt-budget guards
 *
 * These helpers validate whether a composed prompt is safe to place on argv
 * (positional prompt delivery) for Windows CreateProcess limits. They don't
 * actually spawn processes; they compute the would-be sizes and raise an
 * actionable error string when the prompt is too large.
 ***********************/

export class PromptBudgetError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const DEFAULT_MAX_PROMPT_BYTES = 30000; // safe default used by DeepSeek adapter
const CREATE_PROCESS_CMDLINE_LIMIT = 32767; // Windows limit for lpCommandLine

// Fast pre-resolution check: raw prompt bytes vs declared budget
export function checkPromptArgvBudget(promptBytes: number, maxPromptArgBytes = DEFAULT_MAX_PROMPT_BYTES) {
  if (promptBytes > maxPromptArgBytes) {
    throw new PromptBudgetError(
      'AGENT_PROMPT_TOO_LARGE',
      `Prompt is ${promptBytes} bytes which exceeds the allowed argument budget of ${maxPromptArgBytes} bytes. Use a stdin-capable adapter or reduce the prompt size.`,
    );
  }
  return true;
}

// When the resolved binary is a cmd.exe shim (.cmd/.bat), the runtime composes an inner command line
// of the form: cmd.exe /d /s /c "<inner>" where <inner> contains the command + args. The shim path and
// argument quoting can expand the size. This helper estimates the worst-case expansion by doubling
// embedded quotes in the inner command and computing the total length.
export function checkWindowsCmdShimCommandLineBudget(innerCommand: string, maxTotal = CREATE_PROCESS_CMDLINE_LIMIT) {
  // Simulate Windows cmd quoting expansion: inner quotes are doubled when wrapped
  const expandedInner = innerCommand.replace(/"/g, '""');
  const wrapper = 'cmd.exe /d /s /c "' + expandedInner + '"';
  if (wrapper.length > maxTotal) {
    throw new PromptBudgetError(
      'AGENT_PROMPT_TOO_LARGE',
      `Command line length ${wrapper.length} would exceed CreateProcess limit ${maxTotal} when using cmd shim. Reduce prompt or use stdin-capable adapter.`,
    );
  }
  return true;
}

// When the resolved binary is a direct .exe, libuv-style escaping may be applied where backslashes
// preceding quotes are doubled. This function approximates quoting expansion by replacing each quote
// with \" and doubling backslashes before quotes. This is conservative but safe.
export function checkWindowsDirectExeCommandLineBudget(commandLine: string, maxTotal = CREATE_PROCESS_CMDLINE_LIMIT) {
  // Conservative expansion: replace " with \" and double backslashes before quotes
  const expanded = commandLine.replace(/(\\*)"/g, (match, backslashes) => {
    // double backslashes, then escape the quote
    return backslashes + backslashes + '\\"';
  });
  if (expanded.length > maxTotal) {
    throw new PromptBudgetError(
      'AGENT_PROMPT_TOO_LARGE',
      `Command line length ${expanded.length} would exceed CreateProcess limit ${maxTotal} for direct .exe quoting. Reduce prompt or use stdin-capable adapter.`,
    );
  }
  return true;
}
