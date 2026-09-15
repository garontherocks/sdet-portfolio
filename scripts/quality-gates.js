import fs from 'node:fs';
import path from 'node:path';

const qualityPath = path.join(process.cwd(), 'reports', 'quality.json');
const fail = (message) => {
  console.error(`[quality-gate] ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(qualityPath)) {
  console.error('[quality-gate] reports/quality.json is missing');
  process.exit(1);
}

const quality = JSON.parse(fs.readFileSync(qualityPath, 'utf8'));
const cypressTests = quality.suites?.cypress?.tests ?? 0;
const playwrightTests = quality.suites?.playwright?.tests ?? 0;
const performance = quality.lighthouse?.performance;
const accessibility = quality.lighthouse?.accessibility;
const p95 = quality.perf?.http_p95_ms;
const aiTotal = quality.ai?.total ?? 0;
const aiAccuracy = quality.ai?.accuracy;
const aiSchemaCompliance = quality.ai?.schemaCompliance;

console.log('[quality-gate] evidence', {
  cypressTests,
  playwrightTests,
  passRate: quality.passRate,
  performance,
  accessibility,
  p95,
  aiTotal,
  aiAccuracy,
  aiSchemaCompliance,
});

if (cypressTests === 0) fail('Cypress evidence is missing');
if (playwrightTests === 0) fail('Playwright evidence is missing');
if (quality.passRate !== 1) fail(`Expected a 100% pass rate, received ${quality.passRate}`);
if (performance == null) fail('Lighthouse performance evidence is missing');
else if (performance < 0.8) fail(`Lighthouse performance is below 0.80: ${performance}`);
if (accessibility == null) fail('Lighthouse accessibility evidence is missing');
else if (accessibility < 0.9) fail(`Lighthouse accessibility is below 0.90: ${accessibility}`);
if (p95 == null) fail('k6 p95 evidence is missing');
else if (p95 >= 800) fail(`k6 p95 is above 800ms: ${p95}`);
if (aiTotal < 10) fail(`Expected at least 10 AI evaluation cases, received ${aiTotal}`);
if (aiAccuracy == null || aiAccuracy < 0.85) fail(`AI triage accuracy is below 0.85: ${aiAccuracy}`);
if (aiSchemaCompliance !== 1) fail(`AI schema compliance must be 1.0: ${aiSchemaCompliance}`);

if (process.exitCode) process.exit(process.exitCode);
console.log('[quality-gate] all required evidence is present and within threshold');
