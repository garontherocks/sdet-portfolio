import fs from 'node:fs/promises';
import path from 'node:path';
import { getProvider } from './provider.js';
import { argument, readJson } from './io.js';
import { assertSchema } from './schema.js';
import { sanitizeEvidence } from './sanitize.js';

const root = new URL('../', import.meta.url);

export async function generateTestPlan(requirement, options = {}) {
  const [system, schema] = await Promise.all([
    fs.readFile(new URL('prompts/test-generator-v1.md', root), 'utf8'),
    readJson(new URL('schemas/generated-tests.schema.json', root)),
  ]);
  const provider = options.provider || await getProvider(options.providerName);
  const result = await provider.generate({
    task: 'test-generation', system, schema, schemaName: 'generated_test_plan', input: sanitizeEvidence(requirement),
    metadata: { requirementId: options.requirementId },
  });
  assertSchema(result.value, schema);
  const ids = result.value.testCases.map(item => item.id);
  if (new Set(ids).size !== ids.length) throw new Error('Generated test case IDs must be unique');
  return { ...result, promptVersion: 'test-generator-v1', reviewRequired: true };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = argument('--requirement');
  if (!file) throw new Error('Usage: npm run ai:generate-tests -- --requirement <file> [--id REQ-001] [--provider mock|openai]');
  const result = await generateTestPlan(await fs.readFile(file, 'utf8'), {
    requirementId: argument('--id') || path.basename(file, path.extname(file)), providerName: argument('--provider') || undefined,
  });
  const output = argument('--output') || `ai/generated/review-required/${result.value.requirementId}.json`;
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Generated review-only plan: ${output}`);
}
