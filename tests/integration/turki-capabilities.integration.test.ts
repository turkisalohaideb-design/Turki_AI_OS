import path from 'path';
import fs from 'fs';
import { detectAgents } from '../../apps/daemon/src/server';
import { AGENT_DEFS } from '../../apps/daemon/src/runtimes/registry';

jest.setTimeout(20000);

describe('Turki capability discovery (stub)', () => {
  const fixture = path.join(__dirname, '..', 'fixtures', 'bin', 'turki-stub.js');
  beforeAll(() => { if (!fs.existsSync(fixture)) throw new Error('Fixture missing'); });

  test('detectAgents populates models and auth when listModels and authProbe present', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
    def.bin = process.execPath;
    // tweak listModels args to call the fixture
    (def as any).listModels = { listCommandArgs: [fixture, '--list-models'] };
    def.authProbe = { args: [fixture, '--auth-status'], timeoutMs: 1000 } as any;

    const results = await detectAgents();
    const our = results.find((r) => r.id === 'turki-ai-os')!;
    expect(our.available).toBe(true);
    expect(Array.isArray(our.models)).toBe(true);
    expect(our.models && our.models.length > 0).toBe(true);
    expect(our.auth === 'ok' || our.auth === 'unknown').toBeTruthy();
  });
});
