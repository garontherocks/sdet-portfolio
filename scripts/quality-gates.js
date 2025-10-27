// Node script to enforce quality gates based on reports/quality.json
// Exit codes: 0 pass, 1 fail, 78 unstable (flaky)
import fs from 'node:fs';
import path from 'node:path';

const qualityPath = path.join(process.cwd(), 'reports', 'quality.json');

function fail(msg) { console.error('[gates:fail]', msg); process.exit(1); }
function unstable(msg) { console.warn('[gates:unstable]', msg); process.exit(78); }
function info(msg) { console.log('[gates]', msg); }

if (!fs.existsSync(qualityPath)) {
  fail('quality.json not found at ' + qualityPath);
}

const q = JSON.parse(fs.readFileSync(qualityPath, 'utf8'));

const perf = q.lighthouse?.performance == null ? null : Math.round(q.lighthouse.performance * 100);
const a11y = q.lighthouse?.accessibility == null ? null : Math.round(q.lighthouse.accessibility * 100);
const diff = q.visual?.diffRate == null ? null : Math.round(q.visual.diffRate * 10000) / 100; // percent with 2 decimals
const flake = q.flakinessRate == null ? null : +q.flakinessRate; // already percent

info(`Perf: ${perf ?? 'n/a'} | A11y: ${a11y ?? 'n/a'} | Diff%: ${diff ?? 'n/a'} | Flaky%: ${flake ?? 'n/a'}`);

if (perf != null && perf < 90) fail(`Lighthouse performance < 90 (${perf})`);
if (a11y != null && a11y < 90) fail(`Lighthouse accessibility < 90 (${a11y})`);
if (diff != null && diff > 1) fail(`Visual diff > 1% (${diff}%)`);

if (flake != null && flake > 5) unstable(`Flakiness > 5% (${flake}%)`);

info('Quality gates passed');
process.exit(0);

