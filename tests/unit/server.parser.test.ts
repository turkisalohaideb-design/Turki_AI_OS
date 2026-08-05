import { attachJsonEventParser } from '../../apps/daemon/src/runtimes/json-event-stream';
import { attachPlainStreamParser } from '../../apps/daemon/src/runtimes/plain-stream';
import { PassThrough } from 'stream';

function makeChild(stdoutText: string) {
  const fakeChild: any = { stdout: new PassThrough() };
  // push the text asynchronously to simulate process output
  setImmediate(() => {
    fakeChild.stdout.write(stdoutText);
    fakeChild.stdout.end();
    fakeChild.emit = (ev: string) => {};
    fakeChild.once = (ev: string, cb: any) => cb();
  });
  return fakeChild as any;
}

test('json event parser parses JSONL lines and forwards objects', async () => {
  const evs: any[] = [];
  const child = makeChild('{"type":"thinking","progress":0.5}\n{"type":"assistant","delta":"hello"}\n');
  await attachJsonEventParser(child, (e) => evs.push(e));
  expect(evs.length).toBe(2);
  expect(evs[0].type).toBe('thinking');
  expect(evs[1].type).toBe('assistant');
});

test('plain stream parser emits file.write for artifact blocks', async () => {
  const evs: any[] = [];
  const html = '<artifact identifier="landing-page" type="text/html" title="Landing page">\n<!doctype html>hi</artifact>';
  const child = makeChild('some prelude\n' + html + '\nsome epilogue');
  await attachPlainStreamParser(child, (e) => evs.push(e));
  const writes = evs.filter((x) => x.type === 'file.write');
  expect(writes.length).toBe(1);
  expect(writes[0].path).toBe('landing-page.html');
});
