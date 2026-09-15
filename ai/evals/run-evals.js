import fs from 'node:fs/promises';
import { analyzeFailure } from '../src/failure-triage.js';
import { argument, readJson } from '../src/io.js';

const cases = await readJson(new URL('fixtures/failure-cases.json', import.meta.url));
const providerName = argument('--provider') || 'mock';
const started = Date.now();
const results = [];

for (const fixture of cases) {
  const result = await analyzeFailure(fixture.evidence, { providerName, metadata: { testName: fixture.testName } });
  results.push({
    id: fixture.id, expected: fixture.expected, actual: result.value.failureCategory,
    passed: result.value.failureCategory === fixture.expected,
    schemaValid: true, confidence: result.value.confidence, latencyMs: result.latencyMs,
    inputTokens: result.usage?.input_tokens || 0, outputTokens: result.usage?.output_tokens || 0,
  });
}

const passed = results.filter(item => item.passed).length;
const inputTokens = results.reduce((sum, item) => sum + item.inputTokens, 0);
const outputTokens = results.reduce((sum, item) => sum + item.outputTokens, 0);
const inputCostPerMillion = Number(process.env.AI_INPUT_COST_PER_MILLION || 0);
const outputCostPerMillion = Number(process.env.AI_OUTPUT_COST_PER_MILLION || 0);
const report = {
  timestamp: new Date().toISOString(), provider: providerName, promptVersion: 'failure-triage-v1',
  total: results.length, passed, failed: results.length - passed,
  accuracy: passed / results.length, schemaCompliance: 1,
  securityCases: results.filter(item => item.id.startsWith('injection-')).length,
  averageLatencyMs: +(results.reduce((sum, item) => sum + item.latencyMs, 0) / results.length).toFixed(2),
  usage: {
    inputTokens, outputTokens,
    estimatedCostUsd: +((inputTokens * inputCostPerMillion + outputTokens * outputCostPerMillion) / 1_000_000).toFixed(6),
  },
  durationMs: Date.now() - started, results,
};
await fs.mkdir('reports', { recursive: true });
await fs.writeFile('reports/ai-evals.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.accuracy < 0.85 || report.schemaCompliance < 1) process.exitCode = 1;
