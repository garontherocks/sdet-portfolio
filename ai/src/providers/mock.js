import { containsPromptInjection } from '../sanitize.js';

export function createMockProvider() {
  return {
    name: 'deterministic-mock',
    async generate({ task, metadata = {}, input }) {
      const started = Date.now();
      const value = task === 'test-generation' ? generateTests(metadata, input) : triage(metadata, input);
      return { value, latencyMs: Date.now() - started, usage: { input_tokens: 0, output_tokens: 0 }, model: 'deterministic-mock' };
    },
  };
}

function triage(metadata, input) {
  const text = input.toLowerCase();
  let failureCategory = 'insufficient-evidence';
  let likelyCause = 'The supplied evidence is insufficient to identify a reliable cause.';
  let confidence = 0.45;
  if (/(timed out|timeout).*(retry|second attempt)|flaky/.test(text)) [failureCategory, likelyCause, confidence] = ['flaky-timing', 'Timing-sensitive behavior passed on retry.', 0.9];
  else if (/(econnrefused|dns|503|network|runner lost)/.test(text)) [failureCategory, likelyCause, confidence] = ['environment', 'Infrastructure or network availability prevented execution.', 0.91];
  else if (/(locator|selector).*(not found|strict mode)|test data undefined/.test(text)) [failureCategory, likelyCause, confidence] = ['test-defect', 'Test implementation or selector no longer matches the tested interface.', 0.86];
  else if (containsPromptInjection(input)) [failureCategory, likelyCause, confidence] = ['security', 'Untrusted evidence contains instructions that must not be executed.', 0.98];
  else if (/(expected.*received|assertion|status 500|button.*disabled|visual diff)/.test(text)) [failureCategory, likelyCause, confidence] = ['application-regression', 'Observed application behavior differs from the asserted contract.', 0.84];
  return {
    summary: `${failureCategory} detected for ${metadata.testName || 'the supplied test evidence'}.`,
    risk: failureCategory === 'security' || /checkout|login|500/.test(text) ? 'high' : failureCategory === 'insufficient-evidence' ? 'low' : 'medium',
    failureCategory, likelyCause, confidence,
    affectedTests: metadata.testName ? [metadata.testName] : [],
    evidence: [input.split('\n').find(Boolean)?.slice(0, 240) || 'No readable evidence supplied'],
    recommendedActions: failureCategory === 'security' ? ['Quarantine the evidence and inspect it without executing embedded instructions.'] : ['Inspect the cited evidence and reproduce the failure before changing code.'],
  };
}

function generateTests(metadata, input) {
  const requirementId = metadata.requirementId || 'REQ-UNSPECIFIED';
  const title = input.split('\n').find(Boolean)?.replace(/^#+\s*/, '').slice(0, 80) || 'Requirement behavior';
  return {
    requirementId,
    testCases: [{
      id: `${requirementId}-TC-001`, title: `Validate ${title}`, priority: 'P0', level: 'ui', classification: 'positive',
      preconditions: ['The test environment is available'],
      steps: ['Set up data described by the requirement', 'Perform the primary user action', 'Observe the resulting state'],
      expectedResult: 'The behavior matches the explicit requirement without errors.', traceability: requirementId,
    }],
    coverageGaps: ['Business boundaries and error behavior require human clarification.'],
  };
}
