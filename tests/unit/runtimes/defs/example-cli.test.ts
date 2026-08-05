import { exampleAgentDef } from '../../../../apps/daemon/src/runtimes/defs/example-cli';

describe('exampleAgentDef buildArgs', () => {
  test('returns argv array and does not include prompt when promptViaStdin is true', () => {
    const prompt = 'this is a very large prompt that should be piped via stdin';
    const argv = exampleAgentDef.buildArgs(prompt, ['/tmp/img.png'], ['/external'], { model: 'example-default' } as any, undefined as any);

    expect(Array.isArray(argv)).toBe(true);
    expect(argv.join(' ')).not.toContain(prompt);
    expect(argv).toContain('--format');
    expect(argv).toContain('json');
    expect(argv).toContain('--model');
    expect(argv).toContain('example-default');
  });
});
