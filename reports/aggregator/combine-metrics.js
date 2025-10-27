// Node ESM script to aggregate quality signals across tools
// Usage: node reports/aggregator/combine-metrics.js

import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';

const log = (...args) => console.log('[aggregator]', ...args);
const warn = (...args) => console.warn('[aggregator:warn]', ...args);

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true }).catch(() => {});
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function readJSON(file) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    warn(`Failed to read JSON: ${file}: ${e.message}`);
    return null;
  }
}

async function listFilesRecursive(dir, filterFn) {
  const out = [];
  async function walk(d) {
    let entries = [];
    try { entries = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) {
        await walk(p);
      } else if (!filterFn || filterFn(p)) {
        try {
          const stat = await fs.stat(p);
          out.push({ path: p, mtimeMs: stat.mtimeMs });
        } catch { /* ignore */ }
      }
    }
  }
  await walk(dir);
  return out;
}

function pct(numerator, denominator) {
  if (!denominator || denominator <= 0) return null;
  return +(numerator / denominator).toFixed(4);
}

function toSeconds(ms) {
  if (ms == null) return null;
  return +(ms / 1000).toFixed(2);
}

// Parse Mochawesome (Cypress) reports under cypress/reports/mochawesome
async function readCypressMochawesome() {
  const base = path.join(process.cwd(), 'cypress', 'reports', 'mochawesome');
  if (!(await exists(base))) {
    warn('Cypress mochawesome folder not found:', base);
    return { tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0 };
  }

  const merged = path.join(base, 'merged.json');
  const files = [];
  if (await exists(merged)) files.push(merged);
  else {
    const all = (await listFilesRecursive(base, p => p.endsWith('.json')))
      .map(x => x.path)
      .filter(p => !p.endsWith('merged.json'));
    if (all.length) files.push(...all);
  }

  let totals = { tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0 };
  for (const file of files) {
    const json = await readJSON(file);
    if (!json) continue;
    const s = json.stats || {};
    const tests = s.tests ?? 0;
    const passed = s.passes ?? 0;
    const failed = (s.failures ?? 0) + (s.failuresTotal ?? 0);
    const skipped = (s.pending ?? 0) + (s.skipped ?? 0);
    const duration = s.duration ?? 0; // ms
    totals.tests += tests;
    totals.passed += passed;
    totals.failed += failed;
    totals.skipped += skipped;
    totals.durationMs += duration;
  }
  log('Cypress totals:', totals);
  return totals;
}

// Parse Playwright Allure results under playwright/allure-results
async function readPlaywrightAllure() {
  const base = path.join(process.cwd(), 'playwright', 'allure-results');
  if (!(await exists(base))) {
    warn('Playwright allure-results not found:', base);
    return { tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0, flaky: 0 };
  }
  const entries = await listFilesRecursive(base, p => /-result\.json$/i.test(p));
  let totals = { tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0, flaky: 0 };
  for (const { path: p } of entries) {
    const r = await readJSON(p);
    if (!r) continue;
    totals.tests += 1;
    const status = (r.status || '').toLowerCase();
    if (status === 'passed') totals.passed += 1;
    else if (status === 'skipped') totals.skipped += 1;
    else totals.failed += 1; // failed/broken/unknown → failed
    const dur = r.time?.duration ?? (r.time?.stop && r.time?.start ? (r.time.stop - r.time.start) : 0);
    totals.durationMs += Number.isFinite(dur) ? dur : 0;
    if (r.flaky === true || r.statusDetails?.flaky === true) totals.flaky += 1;
  }
  log('Playwright totals:', totals);
  return totals;
}

// Parse Lighthouse last run from .lighthouseci
async function readLighthouse() {
  const base = path.join(process.cwd(), '.lighthouseci');
  if (!(await exists(base))) {
    warn('Lighthouse folder not found:', base);
    return { performance: null, accessibility: null, bestPractices: null, seo: null };
  }
  const files = await listFilesRecursive(base, p => /lhr-.*\.json$/i.test(p));
  if (!files.length) {
    warn('No LHR JSON found in', base);
    return { performance: null, accessibility: null, bestPractices: null, seo: null };
  }
  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const latest = files[0].path;
  const lhr = await readJSON(latest);
  const cats = lhr?.categories || {};
  const out = {
    performance: cats.performance?.score ?? null,
    accessibility: cats.accessibility?.score ?? null,
    bestPractices: cats['best-practices']?.score ?? null,
    seo: cats.seo?.score ?? null,
  };
  log('Lighthouse categories:', out, '(from', latest, ')');
  return out;
}

// Parse Percy summary JSON if present (diff rate)
async function readPercy() {
  const roots = [
    path.join(process.cwd(), 'reports'),
    path.join(process.cwd(), 'cypress'),
    path.join(process.cwd(), 'playwright'),
    path.join(process.cwd(), 'percy'),
  ];
  let candidate = null;
  for (const r of roots) {
    const files = await listFilesRecursive(r, p => /percy.*summary.*\.json$|summary.*percy.*\.json$/i.test(p));
    if (files.length) {
      files.sort((a, b) => b.mtimeMs - a.mtimeMs);
      candidate = files[0].path;
      break;
    }
  }
  if (!candidate) {
    warn('Percy summary not found, diffRate=null');
    return { diffRate: null };
  }
  const s = await readJSON(candidate);
  if (!s) return { diffRate: null };
  let diffRate = null;
  // Heuristics: try common shapes
  if (typeof s.diffRatio === 'number') diffRate = s.diffRatio;
  else if (typeof s.diff_percent === 'number') diffRate = s.diff_percent / 100;
  else if (s.totalComparisons != null && s.totalDiffs != null) diffRate = pct(s.totalDiffs, s.totalComparisons);
  else if (s.summary?.totalComparisons != null && s.summary?.totalDiffs != null) diffRate = pct(s.summary.totalDiffs, s.summary.totalComparisons);
  log('Percy diffRate:', diffRate, '(from', candidate, ')');
  return { diffRate };
}

// Parse k6 summary JSON (latest k6_*_summary.json)
async function readK6() {
  const roots = [path.join(process.cwd(), 'performance'), path.join(process.cwd(), 'reports'), process.cwd()];
  let candidate = null;
  for (const r of roots) {
    const files = await listFilesRecursive(r, p => /k6_.*_summary\.json$/i.test(p));
    if (files.length) {
      files.sort((a, b) => b.mtimeMs - a.mtimeMs);
      candidate = files[0].path;
      break;
    }
  }
  if (!candidate) {
    warn('k6 summary not found, perf.http_p95_ms=null');
    return { http_p95_ms: null };
  }
  const s = await readJSON(candidate);
  if (!s) return { http_p95_ms: null };
  const m = s.metrics?.http_req_duration || s.metrics?.['http_req_duration'];
  let p95 = null;
  if (m) {
    // Try different shapes
    p95 = m['p(95)'] ?? m?.percentiles?.['p(95)'] ?? m?.values?.['p(95)'] ?? null;
  }
  // Some exports use seconds; prefer ms if unit says 'ms'
  if (p95 != null && s.metrics?.http_req_duration?.unit === 's') p95 = p95 * 1000;
  log('k6 http p95(ms):', p95, '(from', candidate, ')');
  return { http_p95_ms: p95 == null ? null : +(+p95).toFixed(2) };
}

async function main() {
  const started = Date.now();
  const buildId = process.env.GITHUB_RUN_ID || process.env.BUILD_ID || process.env.GITHUB_SHA || null;

  const [cypress, playwright, lighthouse, percy, k6] = await Promise.all([
    readCypressMochawesome(),
    readPlaywrightAllure(),
    readLighthouse(),
    readPercy(),
    readK6(),
  ]);

  const totalTests = (cypress.tests || 0) + (playwright.tests || 0);
  const totalPassed = (cypress.passed || 0) + (playwright.passed || 0);
  const totalFailed = (cypress.failed || 0) + (playwright.failed || 0);
  const flaky = playwright.flaky ?? 0; // only reliable source
  const passRate = pct(totalPassed, totalTests);
  const failRate = pct(totalFailed, totalTests);
  const flakinessRate = totalTests > 0 ? +(flaky / totalTests).toFixed(4) : null;
  const tttSeconds = toSeconds((cypress.durationMs || 0) + (playwright.durationMs || 0));

  const quality = {
    timestamp: new Date().toISOString(),
    buildId,
    suites: {
      cypress: { tests: cypress.tests, passed: cypress.passed, failed: cypress.failed, skipped: cypress.skipped },
      playwright: { tests: playwright.tests, passed: playwright.passed, failed: playwright.failed, skipped: playwright.skipped },
    },
    passRate,
    failRate,
    flakinessRate,
    lighthouse: {
      performance: lighthouse.performance,
      accessibility: lighthouse.accessibility,
      bestPractices: lighthouse.bestPractices,
      seo: lighthouse.seo,
    },
    visual: {
      diffRate: percy.diffRate,
    },
    perf: {
      http_p95_ms: k6.http_p95_ms,
    },
    ttt_seconds: tttSeconds,
  };

  const outDir = path.join(process.cwd(), 'reports');
  await ensureDir(outDir);
  await ensureDir(path.join(outDir, 'aggregator'));
  const outFile = path.join(outDir, 'quality.json');
  await fs.writeFile(outFile, JSON.stringify(quality, null, 2));
  const took = ((Date.now() - started) / 1000).toFixed(2);
  log('Wrote', outFile, `in ${took}s`);
}

if (import.meta.url === `file://${path.resolve(process.argv[1])}`) {
  main().catch(err => {
    console.error('[aggregator:error]', err);
    process.exitCode = 1;
  });
}

