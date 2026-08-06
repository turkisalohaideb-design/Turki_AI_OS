#!/usr/bin/env node
// Simple Turki CLI stub for integration tests
// Usage: node turki-stub.js --mode=json|plain [--delay ms] [--malformed]
// Supports: --list-models (prints TSV), --auth-status (prints OK or UNAUTH)

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function parseArgs(arr) {
  const out = {};
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (k.includes('=')) {
        const [key, val] = k.split('=');
        out[key] = val;
      } else {
        // lookahead value
        const next = arr[i+1];
        if (!next || next.startsWith('--')) out[k] = true;
        else { out[k] = next; i++; }
      }
    }
  }
  return out;
}

const argv = parseArgs(args);
const mode = argv.mode || null;
const delay = Number(argv.delay || 50);
const malformed = Boolean(argv.malformed);

// capability modes
if (argv['list-models']) {
  // print TSV: id\tlabel
  console.log('turki-default\tTurki Default');
  console.log('turki-pro\tTurki Pro');
  process.exit(0);
}
if (argv['auth-status']) {
  // print OK
  console.log('OK');
  process.exit(0);
}

let stdinData = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (stdinData += d));
process.stdin.on('end', () => {
  // no-op
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

process.on('SIGTERM', async () => {
  // Graceful shutdown: announce then exit
  process.stdout.write(JSON.stringify({ type: 'shutdown', reason: 'SIGTERM' }) + '\n');
  // flush then exit
  setTimeout(() => process.exit(0), 20);
});

(async function main() {
  if (mode === 'json') {
    // Pretend to accept a JSONL prompt on stdin
    try {
      const parsed = stdinData ? JSON.parse(stdinData) : null;
      // Acknowledge prompt on stderr for testing
      process.stderr.write('ACK_PROMPT\n');
    } catch (e) {
      // not JSON; still continue
      process.stderr.write('PROMPT_NOT_JSON\n');
    }

    // Stream a few JSONL events
    const events = [
      { type: 'thinking', progress: 0.1 },
      { type: 'assistant', delta: 'Hello from Turki stub.\n' },
    ];

    for (const ev of events) {
      process.stdout.write(JSON.stringify(ev) + '\n');
      await sleep(delay);
    }

    // Emit a malformed JSON line if requested
    if (malformed) {
      process.stdout.write('THIS_IS_NOT_JSON\n');
      await sleep(delay);
    }

    // Final result event with usage info
    process.stdout.write(JSON.stringify({ type: 'result', usage: { tokens: 10 } }) + '\n');
    process.exit(0);
  }

  if (mode === 'plain') {
    // Emit some plain textual deltas
    process.stdout.write('Beginning output...\n');
    await sleep(delay);
    // Emit an artifact block
    const artifact = `<artifact identifier="landing-page" type="text/html" title="Landing page">\n<!doctype html><html><body>stub</body></html>\n</artifact>`;
    process.stdout.write(artifact + '\n');
    await sleep(delay);
    process.exit(0);
  }

  // Default behavior: echo prompt then exit
  if (!mode) {
    process.stdout.write('NO_MODE_SPECIFIED\n');
    process.exit(0);
  }
})();
