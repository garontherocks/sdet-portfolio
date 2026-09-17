import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { verifyAgentEvidence } from './verify-agent-evidence.js';

const contractPath = new URL(
  '../../integrations/ai-first-quality-agent/evidence-contract.json',
  import.meta.url,
);

async function loadContract() {
  return JSON.parse(await readFile(contractPath, 'utf8'));
}

test('accepts the reviewed version 1 evidence contract', async () => {
  const contract = await loadContract();
  const summary = verifyAgentEvidence(contract);

  assert.equal(summary.release, '1.0.0');
  assert.equal(summary.artifactName, 'quality-evidence-v1');
  assert.equal(summary.categories.length, 5);
  assert.equal(summary.expectedCostUsd, 0);
});

test('rejects a weakened category pass-rate gate', async () => {
  const contract = await loadContract();
  contract.evaluation.minimumCategoryPassRate = 0.8;

  assert.throws(() => verifyAgentEvidence(contract), /category gates must be 100%/);
});

test('rejects evidence from another repository', async () => {
  const contract = await loadContract();
  contract.source.repository = 'https://example.com/untrusted';

  assert.throws(() => verifyAgentEvidence(contract), /unexpected source repository/);
});
