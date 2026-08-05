const path = require('path');
const fs = require('fs');
const { detectAgents, runAgent } = require('../../../apps/daemon/src/server');
const { AGENT_DEFS } = require('../../../apps/daemon/src/runtimes/registry');

jest.setTimeout(20000);

describe('timeout guards', () => {
  const fixture = path.join(__dirname, '..', 'fixtures', 'bin', 'turki-stub.js');
  beforeAll(() => { if (!fs.existsSync(fixture)) throw new Error('Fixture missing'); });

  test('detectAgents respects version probe timeout', async () => {
    const origEnv = process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS;
    process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS = '5';

    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');
    def.bin = process.execPath;
    const originalVersionArgs = def.versionArgs;
    def.versionArgs = [fixture, '--mode=json', '--delay=1000'];

    const results = await detectAgents();
    const our = results.find((r) => r.id === 'turki-ai-os');
    expect(our).toBeDefined();
    expect(our && our.available).toBe(false);
    expect(our && our.diagnostics && our.diagnostics.length > 0).toBe(true);

    def.versionArgs = originalVersionArgs;
    if (origEnv === undefined) delete process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS; else process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS = origEnv;
  });

  test('runAgent enforces startup timeout and idle timeout', async () => {
    const origStartup = process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS;
    const origIdle = process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS;
    process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS = '20';
    process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS = '50';

    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');
    def.bin = process.execPath;
    const originalBuild = def.buildArgs;
    def.buildArgs = () => [fixture, '--mode=json', '--delay=500'];

    const events = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: 'x', onEvent: (e) => events.push(e) });
    await new Promise((resolve) => child.once('exit', resolve));

    expect(events.some((e) => e.type === 'error' || e.type === 'timeout')).toBe(true);

    def.buildArgs = originalBuild;
    if (origStartup === undefined) delete process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS; else process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS = origStartup;
    if (origIdle === undefined) delete process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS; else process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS = origIdle;
  });
});
