// PR Assistant (stub, no external AI)
// - Reads commits and changed files
// - Estimates risk by area
// - Reads reports/quality.json if present for KPIs
// - Posts a comment using gh api and GITHUB_TOKEN

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts }).trim();
}

function getPrNumber() {
  try {
    const ref = process.env.GITHUB_REF || '';
    const m = ref.match(/refs\/pull\/(\d+)\//);
    if (m) return m[1];
  } catch {}
  try {
    const evtPath = process.env.GITHUB_EVENT_PATH;
    if (evtPath && fs.existsSync(evtPath)) {
      const ev = JSON.parse(fs.readFileSync(evtPath, 'utf8'));
      return ev.pull_request?.number;
    }
  } catch {}
  return null;
}

function getChangedFiles() {
  const base = process.env.GITHUB_BASE_REF;
  const head = process.env.GITHUB_HEAD_REF;
  try { sh('git fetch origin'); } catch {}
  if (base) {
    try { return sh(`git diff --name-only origin/${base}...HEAD`).split('\n').filter(Boolean); } catch {}
  }
  try { return sh('git diff --name-only HEAD~1').split('\n').filter(Boolean); } catch {}
  return [];
}

function classify(files) {
  const areas = {
    cypress: files.filter(f => f.startsWith('cypress/')).length,
    playwright: files.filter(f => f.startsWith('playwright/')).length,
    workflows: files.filter(f => f.startsWith('.github/workflows/')).length,
    performance: files.filter(f => f.startsWith('performance/') || f.includes('k6')).length,
    reports: files.filter(f => f.startsWith('reports/') || f.startsWith('scripts/')).length,
    docs: files.filter(f => f.startsWith('docs/') || f.endsWith('.md')).length,
    config: files.filter(f => /package\.json$|cypress\.config|playwright\.config|eslint|lighthouserc|tsconfig/.test(f)).length,
  };
  const total = files.length;
  const risk = (() => {
    if (areas.workflows > 0 || areas.config > 0) return 'high';
    if (areas.cypress + areas.playwright + areas.performance > 5) return 'medium';
    if (areas.docs && total === areas.docs) return 'low';
    return total > 0 ? 'medium' : 'low';
  })();
  return { areas, total, risk };
}

function readQuality() {
  const p = path.join(process.cwd(), 'reports', 'quality.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function getCommits() {
  try { return sh('git log -n 10 --pretty=%s').split('\n').filter(Boolean); } catch { return []; }
}

function buildBody(ctx) {
  const { files, classes, commits, q } = ctx;
  const lines = [];
  lines.push('Areas afectadas:');
  for (const [k, v] of Object.entries(classes.areas)) lines.push(`- ${k}: ${v}`);
  lines.push(`Riesgo estimado: ${classes.risk}`);
  if (q) {
    const pass = q.passRate != null ? (q.passRate * 100).toFixed(1) + '%' : 'n/a';
    const flaky = q.flakinessRate != null ? q.flakinessRate.toFixed(2) + '%' : 'n/a';
    const p95 = q.perf?.http_p95_ms != null ? q.perf.http_p95_ms + ' ms' : 'n/a';
    const lh = q.lighthouse?.performance != null ? Math.round(q.lighthouse.performance * 100) + '%' : 'n/a';
    const diff = q.visual?.diffRate != null ? (q.visual.diffRate * 100).toFixed(2) + '%' : 'n/a';
    lines.push('KPIs:');
    lines.push(`- passRate: ${pass}`);
    lines.push(`- flakinessRate: ${flaky}`);
    lines.push(`- http_p95_ms: ${p95}`);
    lines.push(`- lighthouse.performance: ${lh}`);
    lines.push(`- visual.diff: ${diff}`);
  } else {
    lines.push('KPIs: quality.json no disponible en este commit');
  }
  lines.push('Artifacts sugeridos:');
  lines.push('- quality-json-*');
  lines.push('- cypress-mochawesome-report / allure-html');
  lines.push('- playwright-allure-results / html');
  lines.push('- lhci-artifacts');
  if (commits.length) {
    lines.push('Commits recientes:');
    for (const c of commits.slice(0, 5)) lines.push(`- ${c}`);
  }
  return lines.join('\n');
}

function postComment(pr, body) {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !pr) {
    console.log('[pr-summary] missing repo or PR number');
    return;
    }
  const cmd = `gh api repos/${repo}/issues/${pr}/comments -f body=@-`;
  execSync(cmd, { input: body, stdio: ['pipe', 'inherit', 'inherit'] });
}

async function main() {
  const pr = getPrNumber();
  const files = getChangedFiles();
  const classes = classify(files);
  const q = readQuality();
  const commits = getCommits();
  const body = buildBody({ files, classes, commits, q });
  postComment(pr, body);
  console.log('[pr-summary] comment posted on PR', pr);
}

main().catch(e => { console.error('[pr-summary:error]', e); process.exit(1); });

