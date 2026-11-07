// Builds a per-test feed of the latest CI run for external consumers
// (the "Quality run" page on victoraller.vercel.app reads it from GitHub Pages).
//
// Usage:
//   node reports/aggregator/build-run-feed.js [output-dir] [--previous-history <file>]
// Writes <output-dir>/latest.json and <output-dir>/history.json
// (default output-dir: reports/dashboards/run).
//
// The output shape is a public contract, documented in docs/run-feed.md.
// Additive fields keep FEED_SCHEMA; a breaking change must bump it and be
// released together with the consumer.

import fs from 'node:fs/promises';
import path from 'node:path';

export const FEED_SCHEMA = 'sdet-portfolio/run-feed@1';
export const HISTORY_SCHEMA = 'sdet-portfolio/run-history@1';
export const HISTORY_LIMIT = 20;

const log = (...args) => console.log('[run-feed]', ...args);
const warn = (...args) => console.warn('[run-feed:warn]', ...args);

const TARGET_NAMES = { chromium: 'Chromium', firefox: 'Firefox', webkit: 'WebKit', api: 'REST', electron: 'Electron' };
const targetName = (value) => TARGET_NAMES[String(value || '').toLowerCase()] || value || 'Chromium';

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

export function summarise(tests) {
  const totals = { tests: tests.length, passed: 0, failed: 0, skipped: 0, flaky: 0, durationMs: 0 };
  for (const test of tests) {
    totals[test.status] += 1;
    if (test.status === 'passed' && test.retries > 0) totals.flaky += 1;
    totals.durationMs += test.durationMs;
  }
  return totals;
}

function joinNames(names) {
  if (names.length <= 1) return names[0] || '';
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function suite(id, name, tool, command, tests) {
  const targets = [...new Set(tests.map((test) => test.target))];
  return {
    id,
    name,
    tool,
    command,
    target: joinNames(targets),
    targets: targets.map((target) => ({ name: target, totals: summarise(tests.filter((test) => test.target === target)) })),
    areas: new Set(tests.map((test) => test.group)).size,
    totals: summarise(tests),
    tests,
  };
}

const isApiPath = (value) => /(^|[\\/#\s>])api[\\/]/i.test(value || '');
const label = (result, name) => result.labels?.find((item) => item.name === name)?.value;
const parameter = (result, name) => result.parameters?.find((item) => item.name === name)?.value;
const byOrder = (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name) || a.target.localeCompare(b.target);

function widen(window, start, stop) {
  if (Number.isFinite(start)) window.start = Math.min(window.start ?? start, start);
  if (Number.isFinite(stop)) window.stop = Math.max(window.stop ?? stop, stop);
}

// Playwright: one Allure *-result.json per attempt; keep the last attempt per test and project.
export async function readPlaywright(root, window = {}) {
  const files = await listFiles(path.join(root, 'playwright', 'allure-results'), (file) => file.endsWith('-result.json'));
  const attempts = new Map();
  for (const file of files) {
    const result = await readJSON(file);
    if (!result) continue;
    const project = parameter(result, 'Project') || label(result, 'parentSuite') || '';
    const key = result.historyId || `${result.testCaseId || result.fullName || result.name || file}|${project}`;
    attempts.set(key, [...(attempts.get(key) || []), result]);
  }
  const ui = [];
  const api = [];
  for (const runs of attempts.values()) {
    runs.sort((a, b) => (a.time?.stop ?? a.stop ?? 0) - (b.time?.stop ?? b.stop ?? 0));
    const last = runs.at(-1);
    for (const run of runs) widen(window, run.time?.start ?? run.start, run.time?.stop ?? run.stop);
    const start = last.time?.start ?? last.start;
    const stop = last.time?.stop ?? last.stop;
    const measured = Number.isFinite(start) && Number.isFinite(stop) ? stop - start : 0;
    const durationMs = Math.max(0, Math.round(last.time?.duration ?? measured));
    const project = parameter(last, 'Project') || label(last, 'parentSuite') || '';
    const where = `${last.fullName || ''} ${label(last, 'titlePath') || ''} ${label(last, 'package') || ''} ${label(last, 'suite') || ''}`;
    const file = (last.fullName || '').split(/[:#]/)[0];
    const isApi = project === 'api' || isApiPath(where);
    const test = {
      name: last.name,
      group: label(last, 'subSuite') || label(last, 'suite') || path.basename(file) || 'Playwright',
      target: isApi ? 'REST' : targetName(project),
      status: normaliseStatus(last.status),
      durationMs,
      retries: runs.length - 1,
    };
    (isApi ? api : ui).push(test);
  }
  return { ui: ui.sort(byOrder), api: api.sort(byOrder) };
}

// Cypress: merged Mochawesome JSON, nested suites.
export async function readCypress(root, window = {}) {
  const base = path.join(root, 'cypress', 'reports', 'mochawesome');
  const merged = path.join(base, 'merged.json');
  const mergedReport = await readJSON(merged);
  const files = mergedReport ? [merged] : await listFiles(base, (file) => file.endsWith('.json'));
  const ui = [];
  const api = [];
  function walk(node, file, trail) {
    const titles = node.title ? [...trail, node.title] : trail;
    for (const item of node.tests || []) {
      const attempts = Array.isArray(item.attempts) ? item.attempts.length : 1;
      const isApi = isApiPath(file);
      const test = {
        name: item.title,
        group: titles.join(' › ') || path.basename(file || 'Cypress'),
        target: isApi ? 'REST' : 'Electron',
        status: normaliseStatus(item.state || (item.pending ? 'pending' : item.skipped ? 'skipped' : '')),
        durationMs: Math.max(0, Math.round(item.duration || 0)),
        retries: Math.max(0, attempts - 1),
      };
      (isApi ? api : ui).push(test);
    }
    for (const child of node.suites || []) walk(child, file || child.file, titles);
  }
  for (const file of files) {
    const report = file === merged ? mergedReport : await readJSON(file);
    widen(window, Date.parse(report?.stats?.start), Date.parse(report?.stats?.end));
    for (const result of report?.results || []) walk(result, result.file || result.fullFile || '', []);
  }
  return { ui, api };
}

export async function readAiEvals(root, provider) {
  const report = await readJSON(path.join(root, 'reports', 'ai-evals.json'));
  return (report?.results || []).map((item) => ({
    name: item.id,
    group: item.id.startsWith('injection-') ? 'Prompt-injection cases' : 'Failure classification',
    target: provider || report?.provider || 'deterministic',
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
  const quality = await readJSON(path.join(root, 'reports', 'quality.json'));
  const window = {};
  const playwright = await readPlaywright(root, window);
  const cypress = await readCypress(root, window);
  const ai = await readAiEvals(root, quality?.ai?.provider);

  const suites = [
    suite('playwright-ui', 'Playwright UI', 'Playwright + TypeScript', 'npx playwright test --project=chromium --project=firefox --project=webkit', playwright.ui),
    suite('playwright-api', 'Playwright API', 'Playwright + TypeScript', 'npx playwright test --project=api', playwright.api),
    suite('cypress-ui', 'Cypress UI', 'Cypress + JavaScript', 'npx cypress run --spec "e2e/ui/**"', cypress.ui),
    suite('cypress-api', 'Cypress API', 'Cypress + JavaScript', 'npx cypress run --spec "e2e/api/**"', cypress.api),
    suite('genai-evals', 'GenAI evals', 'Node evaluation harness', 'npm run ai:eval', ai),
  ].filter((item) => item.tests.length > 0);

  const all = suites.flatMap((item) => item.tests);
  return {
    schema: FEED_SCHEMA,
    generatedAt: now.toISOString(),
    run: runMetadata(env),
    window: window.start != null && window.stop != null
      ? { startedAt: new Date(window.start).toISOString(), finishedAt: new Date(window.stop).toISOString(), wallMs: Math.round(window.stop - window.start) }
      : null,
    totals: summarise(all),
    suites,
    environment: {
      ui: 'https://www.saucedemo.com',
      api: 'https://reqres.in',
      browsers: [...new Set(suites.filter((item) => item.id.endsWith('-ui')).flatMap((item) => item.targets.map((target) => target.name)))],
      runner: env.RUNNER_OS ? `${env.RUNNER_OS} ${env.RUNNER_ARCH || ''}`.trim() : `${process.platform} ${process.arch}`,
      node: process.version,
      pipeline: 'GitHub Actions',
    },
    checks: {
      lighthouse: quality?.lighthouse ?? null,
      k6: quality?.perf ? { httpP95Ms: quality.perf.http_p95_ms ?? null } : null,
    },
    reports: {
      dashboard: '../',
      allure: '../allure/',
      cypress: '../cypress/',
      quality: '../quality.json',
      history: './history.json',
    },
  };
}

// Keeps the last HISTORY_LIMIT runs, newest last, one entry per run id.
export function appendHistory(previous, feed, limit = HISTORY_LIMIT) {
  const runs = Array.isArray(previous?.runs) ? previous.runs.filter((run) => run && run.id !== feed.run.id) : [];
  runs.push({
    id: feed.run.id,
    number: feed.run.number,
    url: feed.run.url,
    commit: feed.run.commit,
    generatedAt: feed.generatedAt,
    wallMs: feed.window?.wallMs ?? null,
    ...feed.totals,
  });
  return { schema: HISTORY_SCHEMA, runs: runs.slice(-limit) };
}

async function main() {
  const root = process.cwd();
  const args = process.argv.slice(2);
  const flag = args.indexOf('--previous-history');
  const previousFile = flag >= 0 ? args[flag + 1] : null;
  const positional = args.filter((_, index) => index !== flag && index !== flag + 1);
  const outDir = path.resolve(root, positional[0] || 'reports/dashboards/run');

  const feed = await buildFeed(root);
  const previous = previousFile ? await readJSON(path.resolve(root, previousFile)) : null;
  if (previous && previous.schema !== HISTORY_SCHEMA) warn('Ignoring previous history with an unknown schema.');
  const history = appendHistory(previous?.schema === HISTORY_SCHEMA ? previous : null, feed);

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'latest.json'), `${JSON.stringify(feed, null, 2)}\n`);
  await fs.writeFile(path.join(outDir, 'history.json'), `${JSON.stringify(history, null, 2)}\n`);
  log(`Wrote ${path.relative(root, outDir)}/latest.json: ${feed.totals.tests} tests in ${feed.suites.length} suites; history has ${history.runs.length} runs`);
  if (feed.totals.tests === 0) {
    warn('No test results found; the feed is empty.');
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
