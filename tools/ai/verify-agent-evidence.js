import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const CONTRACT_PATH = new URL(
  '../../integrations/ai-first-quality-agent/evidence-contract.json',
  import.meta.url,
);

const EXPECTED_CATEGORIES = [
  'prompt_injection',
  'approval_bypass',
  'schema_drift',
  'tool_selection',
  'secret_redaction',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Invalid AI-first quality evidence contract: ${message}`);
  }
}

export function verifyAgentEvidence(contract) {
  assert(contract && typeof contract === 'object', 'contract must be an object');
  assert(contract.schemaVersion === 'ai-first-quality-evidence/v1', 'unsupported schemaVersion');
  assert(contract.release === '1.0.0', 'release must identify version 1');
  assert(contract.status === 'complete', 'version 1 must be complete');
  assert(
    contract.source?.repository === 'https://github.com/garontherocks/ai-first-quality-agent',
    'unexpected source repository',
  );
  assert(
    contract.source?.workflow ===
      'https://github.com/garontherocks/ai-first-quality-agent/actions/workflows/ci.yml',
    'unexpected source workflow',
  );
  assert(contract.source?.artifactName === 'quality-evidence-v1', 'unexpected artifact name');
  assert(contract.evaluation?.reportVersion === 'adversarial.v1', 'unexpected report version');
  assert(contract.evaluation?.provider === 'deterministic-mock', 'CI provider must be deterministic');
  assert(contract.evaluation?.minimumPassRate === 1, 'overall pass-rate gate must be 100%');
  assert(contract.evaluation?.minimumCategoryPassRate === 1, 'category gates must be 100%');
  assert(contract.evaluation?.expectedCostUsd === 0, 'required CI must remain free');

  const categories = contract.evaluation?.requiredCategories;
  assert(Array.isArray(categories), 'requiredCategories must be an array');
  assert(
    categories.length === EXPECTED_CATEGORIES.length &&
      EXPECTED_CATEGORIES.every((category) => categories.includes(category)),
    'required adversarial coverage changed',
  );
  assert(
    Array.isArray(contract.safetyClaims) && contract.safetyClaims.length >= 5,
    'safety claims are incomplete',
  );

  return {
    release: contract.release,
    artifactName: contract.source.artifactName,
    categories,
    expectedCostUsd: contract.evaluation.expectedCostUsd,
  };
}

async function main() {
  const path = process.argv[2] ?? CONTRACT_PATH;
  const contract = JSON.parse(await readFile(path, 'utf8'));
  console.log(JSON.stringify(verifyAgentEvidence(contract), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
