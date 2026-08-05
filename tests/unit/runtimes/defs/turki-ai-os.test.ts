import { turkiAgentDef } from '../../../../apps/daemon/src/runtimes/defs/turki-ai-os';

describe('turkiAgentDef buildArgs', () => {
  test('constructs argv without embedding the prompt (stdin mode)', () => {
    const prompt = 'const large = "this is a code block";';
    const argv = turkiAgentDef.buildArgs(prompt, ['/tmp/img1.png'], ['/extra/root'], { model: 'turki-default' }, { sessionId: 'abc123' });

    expect(argv).toEqual(expect.arrayContaining(['chat', '--format', 'json', '--non-interactive']));
    expect(argv).toContain('--model');
    expect(argv).toContain('turki-default');
    expect(argv).toContain('--add-dir');
    expect(argv).toContain('/extra/root');
    expect(argv).toContain('--attachment');
    expect(argv).toContain('/tmp/img1.png');
    expect(argv).toContain('--resume');
    expect(argv).toContain('abc123');
  });
});
