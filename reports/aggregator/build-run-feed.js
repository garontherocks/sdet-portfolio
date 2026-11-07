// Builds a per-test feed of the latest CI run for external consumers
// (the "Quality run" page on victoraller.vercel.app reads it from GitHub Pages).
//
// Usage: node reports/aggregator/build-run-feed.js [output-file]
// Default output: reports/dashboards/run/latest.json
//
// The output shape is a public contract, documented in docs/run-feed.md.
// Any breaking change must bump FEED_SCHEMA and be coordinated with consumers.

import fs from 'node:fs/promises';
import path from 'node:path';

export const FEED_SCHEMA = 'sdet-portfolio/run-feed@1';

const log = (...args) => console.log('[run-feed]', ...args);
const warn = (...args) => console.warn('[run-feed:warn]', ...args);

async function readJSON(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') warn(`Failed to read ${file}: ${error.message}`);
    return null;
  }
}

async function listFiles(dir, predicate) {
  const out = [];
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out.sort();
}

export function normaliseStatus(value) {
  const status = String(value || '').toLowerCase();
  if (status === 'passed') return 'passed';
  if (status === 'skipped' || status === 'pending') return 'skipped';
  return 'failed'; // failed, broken, unknown
}

function summarise(tests) {
  const totals = { tests: tests.length, passed: 0, failed: 0, skipped: 0, flaky: 0, durationMs: 0 };
  for (const test of tests) {
    totals[test.status] += 1;
    if (test.status === 'passed' && test.retries > 0) totals.flaky += 1;
    totals.durationMs += test.durationMs;
  }
  return totals;
}

function suite(id, name, tool, target, tests) {
  return { id, name, tool, target, totals: summarise(tests), tests };
}

const isApiPath = (value) => /(^|[\\/#\s])api[\\/]/i.test(value || '');
const label = (result, name) => result.labels?.find((item) => item.name === name)?.value;

// Playwright: one Allure *-result.json per attempt; keep the last attempt per test.
export async function readPlaywright(root) {
  const files = await listFiles(path.join(root, 'playwright', 'allure-results'), (file) => file.endsWith('-result.json'));
  const attempts = new Map();
  for (const file of files) {
    const result = await readJSON(file);
    if (!result) continue;
    const key = result.historyId || result.testCaseId || result.fullName || result.name || file;
    attempts.set(key, [...(attempts.get(key) || []), result]);
  }
  const ui = [];
  const api = [];
  for (const runs of attempts.values()) {
    runs.sort((a, b) => (a.time?.stop ?? a.stop ?? 0) - (b.time?.stop ?? b.stop ?? 0));
    const last = runs.at(-1);
    const start = last.time?.start ?? last.start;
    const stop = last.time?.stop ?? last.stop;
    const measured = Number.isFinite(start) && Number.isFinite(stop) ? stop - start : 0;
    const durationMs = Math.max(0, Math.round(last.time?.duration ?? measured));
    const where = `${last.fullName || ''} ${label(last, 'package') || ''} ${label(last, 'suite') || ''}`;
    const file = (last.fullName || '').split(/[:#]/)[0];
    const test = {
      name: last.name,
      group: label(last, 'subSuite') || label(last, 'suite') || path.basename(file) || 'Playwright',
      status: normaliseStatus(last.status),
      durationMs,
      retries: runs.length - 1,
    };
    (isApiPath(where) ? api : ui).push(test);
  }
  const byOrder = (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name);
  return { ui: ui.sort(byOrder), api: api.sort(byOrder) };
}

// Cypress: merged Mochawesome JSON, nested suites.
export async function readCypress(root) {
  const base = path.join(root, 'cypress', 'reports', 'mochawesome');
  const merged = path.join(base, 'merged.json');
  const files = (await readJSON(merged)) ? [merged] : await listFiles(base, (file) => file.endsWith('.json'));
  const ui = [];
  const api = [];
  function walk(node, file, trail) {
    const titles = node.title ? [...trail, node.title] : trail;
    for (const item of node.tests || []) {
      const attempts = Array.isArray(item.attempts) ? item.attempts.length : 1;
      const test = {
        name: item.title,
        group: titles.join(' › ') || path.basename(file || 'Cypress'),
        status: normaliseStatus(item.state || (item.pending ? 'pending' : item.skipped ? 'skipped' : '')),
        durationMs: Math.max(0, Math.round(item.duration || 0)),
        retries: Math.max(0, attempts - 1),
      };
      (isApiPath(file) ? api : ui).push(test);
    }
    for (const child of node.suites || []) walk(child, file || child.file, titles);
  }
  for (const file of files) {
    const report = await readJSON(file);
    for (const result of report?.results || []) walk(result, result.file || result.fullFile || '', []);
  }
  return { ui, api };
}

export async function readAiEvals(root) {
  const report = await readJSON(path.join(root, 'reports', 'ai-evals.json'));
  return (report?.results || []).map((item) => ({
    name: item.id,
    group: item.id.startsWith('injection-') ? 'Prompt-injection cases' : 'Failure classification',
    status: item.passed ? 'passed' : 'failed',
    durationMs: Math.max(0, Math.round(item.latencyMs || 0)),
    retries: 0,
  }));
}

function runMetadata(env) {
  const repository = env.GITHUB_REPOSITORY || 'garontherocks/sdet-portfolio';
  const server = env.GITHUB_SERVER_URL || 'https://github.com';
  const id = env.GITHUB_RUN_ID || null;
  return {
    id,
    number: env.GITHUB_RUN_NUMBER ? Number(env.GITHUB_RUN_NUMBER) : null,
    attempt: env.GITHUB_RUN_ATTEMPT ? Number(env.GITHUB_RUN_ATTEMPT) : null,
    workflow: env.GITHUB_WORKFLOW || null,
    event: env.GITHUB_EVENT_NAME || null,
    branch: env.GITHUB_REF_NAME || null,
    commit: env.GITHUB_SHA || null,
    repository,
    url: id ? `${server}/${repository}/actions/runs/${id}` : null,
  };
}

export async function buildFeed(root, env = process.env, now = new Date()) {
  const playwright = await readPlaywright(root);
  const cypress = await readCypress(root);
  const ai = await readAiEvals(root);
  const quality = await readJSON(path.join(root, 'reports', 'quality.json'));

  const suites = [
    suite('playwright-ui', 'Playwright UI', 'Playwright + TypeScript', 'Chromium', playwright.ui),
    suite('playwright-api', 'Playwright API', 'Playwright + TypeScript', 'REST', playwright.api),
    suite('cypress-ui', 'Cypress UI', 'Cypress + JavaScript', 'Electron', cypress.ui),
    suite('cypress-api', 'Cypress API', 'Cypress + JavaScript', 'REST', cypress.api),
    suite('genai-evals', 'GenAI evals', 'Node test harness', quality?.ai?.provider || 'deterministic', ai),
  ].filter((item) => item.tests.length > 0);

  const all = suites.flatMap((item) => item.tests);
  return {
    schema: FEED_SCHEMA,
    generatedAt: now.toISOString(),
    run: runMetadata(env),
    totals: summarise(all),
    suites,
    checks: {
      lighthouse: quality?.lighthouse ?? null,
      k6: quality?.perf ? { httpP95Ms: quality.perf.http_p95_ms ?? null } : null,
    },
    reports: {
      dashboard: '../',
      allure: '../allure/',
      cypress: '../cypress/',
      quality: '../quality.json',
    },
  };
}

async function main() {
  const root = process.cwd();
  const output = path.resolve(root, process.argv[2] || 'reports/dashboards/run/latest.json');
  const feed = await buildFeed(root);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(feed, null, 2)}\n`);
  log(`Wrote ${path.relative(root, output)}: ${feed.totals.tests} tests in ${feed.suites.length} suites`);
  if (feed.totals.tests === 0) {
    warn('No test results found; the feed is empty.');
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
