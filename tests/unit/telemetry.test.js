const telemetry = require('../..//apps/daemon/src/telemetry');
const { runAgent } = require('../../apps/daemon/src/server');
const { AGENT_DEFS } = require('../../apps/daemon/src/runtimes/registry');
const path = require('path');

jest.setTimeout(20000);

test('telemetry handler receives run.started and run.finished', async () => {
  const events = [];
  telemetry.addTelemetryHandler((ev) => events.push(ev));

  const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os');
  if (!def) throw new Error('turki-ai-os def missing');
  def.bin = process.execPath;
  const fixture = path.join(__dirname, '..', 'fixtures', 'bin', 'turki-stub.js');
  const originalBuild = def.buildArgs;
  def.buildArgs = () => [fixture, '--mode=json'];

  const child = await runAgent({ agentId: 'turki-ai-os', prompt: 'x', onEvent: () => undefined });
  await new Promise((r) => child.once('exit', r));

  def.buildArgs = originalBuild;

  expect(events.some((e) => e.name === 'run.started')).toBe(true);
  expect(events.some((e) => e.name === 'run.finished' || e.name === 'run.exit')).toBe(true);
});
