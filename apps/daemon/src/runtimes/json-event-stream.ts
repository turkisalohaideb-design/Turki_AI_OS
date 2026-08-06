import { ChildProcess } from 'child_process';

// Attach a simple JSON-line parser to a child's stdout. Each newline-delimited
// JSON message is parsed and forwarded to onEvent. Returns a Promise that
// resolves when the child closes.
export async function attachJsonEventParser(child: ChildProcess, onEvent: (ev: any) => void): Promise<void> {
  if (!child.stdout) return;

  let buf = '';
  child.stdout.on('data', (chunk: Buffer | string) => {
    const str = chunk.toString();
    buf += str;
    let idx: number;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      try {
        const parsed = JSON.parse(line);
        onEvent(parsed);
      } catch (err) {
        // Not JSON — forward as raw text
        onEvent({ type: 'text', text: line });
      }
    }
  });

  await new Promise((resolve) => child.once('close', resolve));
}
