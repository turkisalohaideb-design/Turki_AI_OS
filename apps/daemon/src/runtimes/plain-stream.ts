import { ChildProcess } from 'child_process';
import * as fs from 'fs';

// Simple plain text parser that scans for <artifact identifier="..." type="..."> blocks
// and emits file-write events for recognized mime types. On child close it resolves.
const ARTIFACT_RE = /<artifact\s+identifier="([^"]+)"\s+type="([^"]+)"[^>]*>([\s\S]*?)<\/artifact>/gi;

export async function attachPlainStreamParser(child: ChildProcess, onEvent: (ev: any) => void): Promise<void> {
  let collected = '';
  if (!child.stdout) return;

  child.stdout.on('data', (chunk: Buffer | string) => {
    const s = chunk.toString();
    collected += s;
    // also emit streaming text deltas
    onEvent({ type: 'assistant.delta', text: s });
  });

  await new Promise<void>((resolve) => child.once('close', () => resolve()));

  // On close, scan for artifact blocks
  let m: RegExpExecArray | null;
  while ((m = ARTIFACT_RE.exec(collected))) {
    const identifier = slug(m[1]);
    const mime = m[2];
    const content = m[3];

    let filename: string | undefined;
    if (mime === 'text/html' || mime === 'html') filename = `${identifier}.html`;
    else if (mime === 'text/css' || mime === 'css') filename = `${identifier}.css`;
    else if (mime === 'image/svg+xml' || mime === 'svg') filename = `${identifier}.svg`;
    else if (mime === 'text/markdown' || mime === 'md' || mime === 'markdown') filename = `${identifier}.md`;

    if (filename) {
      onEvent({ type: 'file.write', path: filename, content });
    }
  }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
