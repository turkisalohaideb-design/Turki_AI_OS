const pb = require('../../../apps/daemon/src/runtimes/prompt-budget');

describe('prompt-budget guards', () => {
  test('checkPromptArgvBudget throws for oversized prompt bytes', () => {
    const big = 50000;
    expect(() => pb.checkPromptArgvBudget(big, 30000)).toThrow(pb.PromptBudgetError);
  });

  test('checkWindowsCmdShimCommandLineBudget throws when expanded command exceeds limit', () => {
    const manyQuotes = 'node -e "console.log(\"' + 'x'.repeat(32000) + '\")"';
    expect(() => pb.checkWindowsCmdShimCommandLineBudget(manyQuotes, 32767)).toThrow(pb.PromptBudgetError);
  });

  test('checkWindowsDirectExeCommandLineBudget throws for dangerous expansion', () => {
    const cmd = 'mytool "' + 'a'.repeat(32000) + '"';
    expect(() => pb.checkWindowsDirectExeCommandLineBudget(cmd, 32767)).toThrow(pb.PromptBudgetError);
  });
});
