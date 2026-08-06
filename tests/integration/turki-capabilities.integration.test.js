const path = require('path');
const fs = require('fs');
const { detectAgents } = require('../../apps/daemon/src/server');
const { AGENT_DEFS } = require('../../apps/daemon/src/runtimes/registry');

jest.setTimeout(20000);

describe('Turki capability discovery (stub)', () => {
  const fixture = path.join(__dirname, '..', 'fixtures', 'bin', 'turki-stub.js');
  beforeAll(() => { if (!fs.existsSync(fixture)) throw new Error('Fixture missing'); });

  test('detectAgents populates models and auth when listModels and authProbe present', async () => {
    const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
    if (!def) throw new Error('turki-ai-os def missing');
    def.bin = process.execPath;
    def.listModels = { listCommandArgs: [fixture, '--list-models'] };
    def.authProbe = { args: [fixture, '--auth-status'], timeoutMs: 1000 };

    const results = await detectAgents();
    const our = results.find((r) => r.id === 'turki-ai-os');
    expect(our.available).toBe(true);
    expect(Array.isArray(our.models)).toBe(true);
    expect(our.models && our.models.length > 0).toBe(true);
    expect(our.auth === 'ok' || our.auth === 'unknown').toBeTruthy();
  });
});
