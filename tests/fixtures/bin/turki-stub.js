#!/usr/bin/env node
// Simple Turki CLI stub for integration tests
// Usage: node turki-stub.js --mode=json|plain [--delay ms] [--malformed]

const fs = require('fs');
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));
const mode = argv.mode || 'json';
const delay = Number(argv.delay || 50);
const malformed = Boolean(argv.malformed);

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
})();
