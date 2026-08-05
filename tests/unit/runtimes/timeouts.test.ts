import path from 'path';
import fs from 'fs';
import { detectAgents, runAgent } from '../../../apps/daemon/src/server';
import { AGENT_DEFS } from '../../../apps/daemon/src/runtimes/registry';
import * as configMod from '../../../apps/daemon/src/runtimes/config';

jest.setTimeout(20000);

describe('timeout guards', () => {
  const fixture = path.join(__dirname, '..', 'fixtures', 'bin', 'turki-stub.js');
  beforeAll(() => { if (!fs.existsSync(fixture)) throw new Error('Fixture missing'); });

  test('detectAgents respects version probe timeout', async () => {
    // Temporarily set a very small version probe timeout
    const origEnv = process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS;
    process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS = '5';

    // mutate def to point to node + long-running script (simulate hung probe)
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
    def.bin = process.execPath;
    const originalVersionArgs = def.versionArgs;
    // make version probe be a long-running invocation of the stub
    def.versionArgs = [fixture, '--mode=json', '--delay=1000'];

    const results = await detectAgents();
    const our = results.find((r) => r.id === 'turki-ai-os');
    expect(our).toBeDefined();
    // With a tiny timeout, detection should mark binary as unavailable (diagnostics present)
    expect(our?.available).toBe(false);
    expect(our?.diagnostics && our.diagnostics.length > 0).toBe(true);

    // restore
    def.versionArgs = originalVersionArgs;
    if (origEnv === undefined) delete process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS; else process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS = origEnv;
  });

  test('runAgent enforces startup timeout and idle timeout', async () => {
    // Set startup and idle timeouts very small
    const origStartup = process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS;
    const origIdle = process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS;
    process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS = '20';
    process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS = '50';

    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
    def.bin = process.execPath;
    const originalBuild = def.buildArgs;
    // Use a stub that delays before printing anything to trigger startup timeout
    def.buildArgs = () => [fixture, '--mode=json', '--delay=500'];

    const events: any[] = [];
    const child = await runAgent({ agentId: 'turki-ai-os', prompt: 'x', onEvent: (e) => events.push(e) });
    await new Promise((resolve) => child.once('exit', resolve));

    // Expect an error event for startup timeout or parser idle
    expect(events.some((e) => e.type === 'error' || e.type === 'timeout')).toBe(true);

    def.buildArgs = originalBuild;
    if (origStartup === undefined) delete process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS; else process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS = origStartup;
    if (origIdle === undefined) delete process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS; else process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS = origIdle;
  });
});
