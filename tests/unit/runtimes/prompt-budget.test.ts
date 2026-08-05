import { checkPromptArgvBudget, checkWindowsCmdShimCommandLineBudget, checkWindowsDirectExeCommandLineBudget, PromptBudgetError } from '../../../apps/daemon/src/runtimes/prompt-budget';

describe('prompt-budget guards', () => {
  test('checkPromptArgvBudget throws for oversized prompt bytes', () => {
    const big = 50000;
    expect(() => checkPromptArgvBudget(big, 30000)).toThrow(PromptBudgetError);
  });

  test('checkWindowsCmdShimCommandLineBudget throws when expanded command exceeds limit', () => {
    const manyQuotes = 'node -e "console.log(\"' + 'x'.repeat(32000) + '\")"';
    expect(() => checkWindowsCmdShimCommandLineBudget(manyQuotes, 32767)).toThrow(PromptBudgetError);
  });

  test('checkWindowsDirectExeCommandLineBudget throws for dangerous expansion', () => {
    const cmd = 'mytool "' + 'a'.repeat(32000) + '"';
    expect(() => checkWindowsDirectExeCommandLineBudget(cmd, 32767)).toThrow(PromptBudgetError);
  });
});
