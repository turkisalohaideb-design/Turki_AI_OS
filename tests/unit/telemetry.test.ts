import { addTelemetryHandler } from '../..//apps/daemon/src/telemetry';
import { runAgent } from '../../apps/daemon/src/server';
import { AGENT_DEFS } from '../../apps/daemon/src/runtimes/registry';
import path from 'path';

jest.setTimeout(20000);

test('telemetry handler receives run.started and run.finished', async () => {
  const events: any[] = [];
  addTelemetryHandler((ev) => events.push(ev));

  const def = AGENT_DEFS.find((d) => d.id === 'turki-ai-os')!;
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
