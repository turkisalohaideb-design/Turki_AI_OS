const path = require('path');
const fs = require('fs');
const { detectAgents, runAgent } = require('../../apps/daemon/src/server');
const { AGENT_DEFS } = require('../../apps/daemon/src/runtimes/registry');

jest.setTimeout(20000);

describe('Turki AI OS integration (stub)', () => {
  const fixture = path.join(__dirname, '..', 'fixtures', 'bin', 'turki-stub.js');

  beforeAll(() => {
    if (!fs.existsSync(fixture)) throw new Error('Fixture missing: ' + fixture);
  });

  test('detectAgents recognizes node runtime for turki-agent when bin is node', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');

    def.bin = process.execPath;

    const results = await detectAgents();
    const our = results.find((r) => r.id === 'turki-ai-os');
    expect(our).toBeDefined();
    expect(our && our.available).toBe(true);
  });

  test('runAgent streams JSON events and recovers malformed JSON', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');
    def.bin = process.execPath;
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = (prompt) => [fixturePath, '--mode=json', '--malformed'];

    const events = [];
    const child = await runAgent({
      agentId: 'turki-ai-os',
      prompt: JSON.stringify({ user: 'hello' }),
      onEvent: (e) => events.push(e),
      imagePaths: [],
    });

    await new Promise((resolve) => child.once('exit', resolve));

    const types = events.map((e) => e.type || 'unknown');
    expect(types).toContain('thinking');
    expect(types).toContain('assistant');
    expect(events.some((e) => e.type === 'text' && typeof e.text === 'string')).toBe(true);
    expect(types).toContain('result');

    def.buildArgs = originalBuild;
  });

  test('runAgent plain parser extracts artifacts and emits file.write', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');
    def.bin = process.execPath;
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = () => [fixturePath, '--mode=plain'];

    const events = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: 'x', onEvent: (e) => events.push(e) });
    await new Promise((resolve) => child.once('exit', resolve));

    const writes = events.filter((e) => e.type === 'file.write');
    expect(writes.length).toBeGreaterThan(0);
    expect(writes[0].path).toBe('landing-page.html');

    def.buildArgs = originalBuild;
  });

  test('stdin prompt delivery is observed via stub ACK on stderr', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');
    def.bin = process.execPath;
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = () => [fixturePath, '--mode=json'];

    const events = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: JSON.stringify({ user: 'stdin-check' }), onEvent: (e) => events.push(e) });

    await new Promise((resolve) => child.once('exit', resolve));
    const stderrEvents = events.filter((e) => e.type === 'stderr' || (e && e.stderr));
    expect(stderrEvents.length).toBeGreaterThan(0);
    expect(stderrEvents.some((s) => (s.text || s.stderr || '').includes('ACK_PROMPT') || (s.text || s.stderr || '').includes('PROMPT_NOT_JSON'))).toBe(true);

    def.buildArgs = originalBuild;
  });

  test('cancellation and graceful shutdown via SIGTERM', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');
    def.bin = process.execPath;
    const fixturePath = fixture;
    const originalBuild = def.buildArgs;
    def.buildArgs = () => [fixturePath, '--mode=json', '--delay=200'];

    const events = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: 'cancel-test', onEvent: (e) => events.push(e) });

    await new Promise((r) => setTimeout(r, 60));
    child.kill('SIGTERM');

    await new Promise((resolve) => child.once('exit', resolve));

    expect(events.some((e) => (e.type === 'shutdown' || (e && e.type === 'exit') || (e && e.code === 0)))).toBeTruthy();

    def.buildArgs = originalBuild;
  });
});
