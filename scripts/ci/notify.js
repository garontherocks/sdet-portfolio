// Sends a short summary to Slack/Teams if webhook is provided
// Usage: node scripts/ci/notify.js
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const qualityPath = path.join(process.cwd(), 'reports', 'quality.json');
if (!fs.existsSync(qualityPath)) {
  console.log('[notify] quality.json not found, skipping');
  process.exit(0);
}
const q = JSON.parse(fs.readFileSync(qualityPath, 'utf8'));

const pass = q.passRate != null ? (q.passRate * 100).toFixed(1) + '%' : 'n/a';
const flaky = q.flakinessRate != null ? q.flakinessRate.toFixed(2) + '%' : 'n/a';
const p95 = q.perf?.http_p95_ms != null ? q.perf.http_p95_ms + ' ms' : 'n/a';
const lh = q.lighthouse?.performance != null ? Math.round(q.lighthouse.performance * 100) + '%' : 'n/a';
const diff = q.visual?.diffRate != null ? (q.visual.diffRate * 100).toFixed(2) + '%' : 'n/a';

const text = `Build ${q.buildId || ''} | Pass ${pass} | Flaky ${flaky} | p95 ${p95} | LH Perf ${lh} | Visual ${diff}`.trim();

const slack = process.env.SLACK_WEBHOOK_URL;
const teams = process.env.TEAMS_WEBHOOK_URL;

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ method: 'POST', hostname: u.hostname, path: u.pathname + u.search, headers: { 'Content-Type': 'application/json' } }, res => {
      res.on('data', () => {});
      res.on('end', resolve);
    });
    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

(async () => {
  try {
    if (slack) {
      await postJson(slack, { text });
      console.log('[notify] sent to Slack');
    } else if (teams) {
      await postJson(teams, { text });
      console.log('[notify] sent to Teams');
    } else {
      console.log('[notify] no webhook, summary:', text);
    }
  } catch (e) {
    console.warn('[notify] failed:', e.message);
  }
})();

