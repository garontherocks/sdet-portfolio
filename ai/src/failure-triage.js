import fs from 'node:fs/promises';
import path from 'node:path';
import { getProvider } from './provider.js';
import { argument, readJson } from './io.js';
import { assertSchema } from './schema.js';
import { sanitizeEvidence } from './sanitize.js';

const root = new URL('../', import.meta.url);

export async function analyzeFailure(evidence, options = {}) {
  const [system, schema] = await Promise.all([
    fs.readFile(new URL('prompts/failure-triage-v1.md', root), 'utf8'),
    readJson(new URL('schemas/failure-analysis.schema.json', root)),
  ]);
  const provider = options.provider || await getProvider(options.providerName);
  const safeEvidence = sanitizeEvidence(evidence);
  const result = await provider.generate({
    task: 'failure-triage', system, schema, schemaName: 'failure_analysis', input: safeEvidence, metadata: options.metadata,
  });
  assertSchema(result.value, schema);
  return { ...result, promptVersion: 'failure-triage-v1' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = argument('--input');
  if (!file) throw new Error('Usage: npm run ai:triage -- --input <evidence.json|txt> [--provider mock|openai]');
  const evidence = await fs.readFile(file, 'utf8');
  const result = await analyzeFailure(evidence, { providerName: argument('--provider') || undefined, metadata: { testName: argument('--test') } });
  const serialized = `${JSON.stringify(result, null, 2)}\n`;
  const output = argument('--output');
  if (output) {
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, serialized);
    console.log(`Wrote validated triage result: ${output}`);
  } else {
    console.log(serialized);
  }
}
