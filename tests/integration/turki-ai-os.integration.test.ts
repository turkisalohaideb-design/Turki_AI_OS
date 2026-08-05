import path from 'path';
import fs from 'fs';
import { detectAgents, runAgent } from '../../apps/daemon/src/server';
import { AGENT_DEFS } from '../../apps/daemon/src/runtimes/registry';

jest.setTimeout(20000);

describe('Turki AI OS integration (stub)', () => {
  const fixture = path.join(__dirname, '..', 'fixtures', 'bin', 'turki-stub.js');

  beforeAll(() => {
    // ensure fixture exists
    if (!fs.existsSync(fixture)) throw new Error('Fixture missing: ' + fixture);
  });

  test('detectAgents recognizes node runtime for turki-agent when bin is node', async () => {
    // mutate in-memory def to use Node and run the stub
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');

    // Point binary to node and ensure version probe works
    def.bin = process.execPath; // node

    const results = await detectAgents();
    const our = results.find((r) => r.id === 'turki-ai-os');
    expect(our).toBeDefined();
    expect(our?.available).toBe(true);
  });

  test('runAgent streams JSON events and recovers malformed JSON', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
    def.bin = process.execPath;
    // override buildArgs to run the fixture
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = (prompt: string) => [fixturePath, '--mode=json', '--malformed'];

    const events: any[] = [];
    const child = await runAgent({
      agentId: 'turki-ai-os',
      prompt: JSON.stringify({ user: 'hello' }),
      onEvent: (e) => events.push(e),
      imagePaths: [],
    });

    // Wait for child to exit
    await new Promise((resolve) => child.once('exit', resolve));

    // We expect thinking, assistant, malformed (as text), result
    const types = events.map((e) => e.type || (e as any).type || 'unknown');
    expect(types).toContain('thinking');
    expect(types).toContain('assistant');
    expect(events.some((e) => e.type === 'text' && typeof e.text === 'string')).toBe(true); // malformed forwarded
    expect(types).toContain('result');

    // restore
    def.buildArgs = originalBuild;
  });

  test('runAgent plain parser extracts artifacts and emits file.write', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
    def.bin = process.execPath;
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = () => [fixturePath, '--mode=plain'];

    const events: any[] = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: 'x', onEvent: (e) => events.push(e) });
    await new Promise((resolve) => child.once('exit', resolve));

    const writes = events.filter((e) => e.type === 'file.write');
    expect(writes.length).toBeGreaterThan(0);
    expect(writes[0].path).toBe('landing-page.html');

    def.buildArgs = originalBuild;
  });

  test('stdin prompt delivery is observed via stub ACK on stderr', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
    def.bin = process.execPath;
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = () => [fixturePath, '--mode=json'];

    const events: any[] = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: JSON.stringify({ user: 'stdin-check' }), onEvent: (e) => events.push(e) });

    // Wait for stub's stderr ACK to be received; runAgent forwards stderr as events with type 'stderr'
    await new Promise((resolve) => child.once('exit', resolve));
    const stderrEvents = events.filter((e) => e.type === 'stderr' || (e && e.stderr));
    expect(stderrEvents.length).toBeGreaterThan(0);
    expect(stderrEvents.some((s) => (s.text || s.stderr || '').includes('ACK_PROMPT') || (s.text || s.stderr || '').includes('PROMPT_NOT_JSON'))).toBe(true);

    def.buildArgs = originalBuild;
  });

  test('cancellation and graceful shutdown via SIGTERM', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
    def.bin = process.execPath;
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = () => [fixturePath, '--mode=json', '--delay=200'];

    const events: any[] = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: 'cancel-test', onEvent: (e) => events.push(e) });

    // Wait a short moment then cancel
    await new Promise((r) => setTimeout(r, 60));
    child.kill('SIGTERM');

    // Wait for exit
    await new Promise((resolve) => child.once('exit', resolve));

    // Expect shutdown event emitted by stub
    expect(events.some((e) => (e.type === 'shutdown' || (e && e.type === 'exit') || (e && e.code === 0)))).toBeTruthy();

    def.buildArgs = originalBuild;
  });
});
