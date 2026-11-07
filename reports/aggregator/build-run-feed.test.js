import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { appendHistory, buildFeed, FEED_SCHEMA, HISTORY_SCHEMA, normaliseStatus } from './build-run-feed.js';

const script = new URL('./build-run-feed.js', import.meta.url);

function writeJson(root, relativePath, value) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
}

const project = (name) => [{ name: 'Project', value: name }];

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'run-feed-'));
  // Same UI test in two browsers; in Chromium it failed once and passed on retry.
  writeJson(root, 'playwright/allure-results/a-result.json', {
    historyId: 'login-chromium', testCaseId: 'login', name: 'logs in with valid user', status: 'failed', fullName: 'ui/login/login.spec.ts:5:7',
    labels: [{ name: 'subSuite', value: 'Login' }], parameters: project('chromium'), time: { start: 1000, stop: 1900, duration: 900 },
  });
  writeJson(root, 'playwright/allure-results/b-result.json', {
    historyId: 'login-chromium', testCaseId: 'login', name: 'logs in with valid user', status: 'passed', fullName: 'ui/login/login.spec.ts:5:7',
    labels: [{ name: 'subSuite', value: 'Login' }], parameters: project('chromium'), time: { start: 2000, stop: 2800, duration: 800 },
  });
  writeJson(root, 'playwright/allure-results/c-result.json', {
    historyId: 'login-webkit', testCaseId: 'login', name: 'logs in with valid user', status: 'passed', fullName: 'ui/login/login.spec.ts:5:7',
    labels: [{ name: 'subSuite', value: 'Login' }], parameters: project('webkit'), time: { start: 1000, stop: 2000, duration: 1000 },
  });
  // API test in its own project, broken status, no explicit duration.
  writeJson(root, 'playwright/allure-results/d-result.json', {
    testCaseId: 'create', name: 'creates a user', status: 'broken', fullName: 'api/create-user.spec.ts:3:5',
    labels: [], parameters: project('api'), time: { start: 0, stop: 120 },
  });
  writeJson(root, 'cypress/reports/mochawesome/merged.json', {
    stats: { tests: 3, start: '1970-01-01T00:00:00.500Z', end: '1970-01-01T00:00:05.000Z' },
    results: [
      { file: 'e2e/ui/cart/add-to-cart.cy.js', suites: [{ title: 'Cart', tests: [{ title: 'adds a product', state: 'passed', duration: 1500 }], suites: [{ title: 'Empty', tests: [{ title: 'shows nothing', state: 'pending', duration: 0 }] }] }] },
      { file: 'e2e/api/users-crud.cy.js', suites: [{ title: 'Users', tests: [{ title: 'lists users', state: 'passed', duration: 300 }] }] },
    ],
  });
  writeJson(root, 'reports/ai-evals.json', {
    results: [{ id: 'timeout-1', passed: true, latencyMs: 2 }, { id: 'injection-1', passed: false, latencyMs: 3 }],
  });
  writeJson(root, 'reports/quality.json', { lighthouse: { performance: 0.95 }, perf: { http_p95_ms: 4.4 }, ai: { provider: 'mock' } });
  return root;
}

const env = { GITHUB_RUN_ID: '123', GITHUB_RUN_NUMBER: '45', GITHUB_SHA: 'abc123', GITHUB_REF_NAME: 'main', GITHUB_REPOSITORY: 'garontherocks/sdet-portfolio', RUNNER_OS: 'Linux', RUNNER_ARCH: 'X64' };

test('normalises Allure and Mochawesome statuses', () => {
  assert.equal(normaliseStatus('passed'), 'passed');
  assert.equal(normaliseStatus('pending'), 'skipped');
  assert.equal(normaliseStatus('skipped'), 'skipped');
  assert.equal(normaliseStatus('broken'), 'failed');
  assert.equal(normaliseStatus(undefined), 'failed');
});

test('builds per-suite and per-browser results, keeps the last attempt and splits UI from API', async () => {
  const root = fixture();
  test.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const feed = await buildFeed(root, env, new Date('2026-11-07T00:00:00Z'));

  assert.equal(feed.schema, FEED_SCHEMA);
  assert.equal(feed.generatedAt, '2026-11-07T00:00:00.000Z');
  assert.equal(feed.run.url, 'https://github.com/garontherocks/sdet-portfolio/actions/runs/123');
  assert.equal(feed.run.number, 45);
  assert.deepEqual(feed.suites.map((item) => item.id), ['playwright-ui', 'playwright-api', 'cypress-ui', 'cypress-api', 'genai-evals']);

  const [pwUi, pwApi, cyUi, cyApi, ai] = feed.suites;
  assert.deepEqual(pwUi.tests, [
    { name: 'logs in with valid user', group: 'Login', target: 'Chromium', status: 'passed', durationMs: 800, retries: 1 },
    { name: 'logs in with valid user', group: 'Login', target: 'WebKit', status: 'passed', durationMs: 1000, retries: 0 },
  ]);
  assert.equal(pwUi.target, 'Chromium and WebKit');
  assert.deepEqual(pwUi.targets.map((item) => [item.name, item.totals.passed, item.totals.flaky]), [['Chromium', 1, 1], ['WebKit', 1, 0]]);
  assert.equal(pwUi.areas, 1);
  assert.match(pwUi.command, /npx playwright test/);
  assert.deepEqual([pwApi.target, pwApi.tests[0].status, pwApi.tests[0].durationMs], ['REST', 'failed', 120]);
  assert.deepEqual(cyUi.tests.map((item) => [item.group, item.target, item.status]), [['Cart', 'Electron', 'passed'], ['Cart › Empty', 'Electron', 'skipped']]);
  assert.equal(cyApi.target, 'REST');
  assert.deepEqual(ai.tests.map((item) => item.group), ['Failure classification', 'Prompt-injection cases']);
  assert.equal(ai.target, 'mock');

  assert.deepEqual(feed.totals, { tests: 8, passed: 5, failed: 2, skipped: 1, flaky: 1, durationMs: 3725 });
  // Window spans the earliest start (Playwright, 0 ms) to the latest end (Cypress, 5000 ms).
  assert.deepEqual(feed.window, { startedAt: '1970-01-01T00:00:00.000Z', finishedAt: '1970-01-01T00:00:05.000Z', wallMs: 5000 });
  assert.deepEqual(feed.environment.browsers, ['Chromium', 'WebKit', 'Electron']);
  assert.equal(feed.environment.runner, 'Linux X64');
  assert.deepEqual(feed.checks, { lighthouse: { performance: 0.95 }, k6: { httpP95Ms: 4.4 } });
  assert.equal(feed.reports.history, './history.json');
});

test('history keeps one entry per run, newest last, capped at the limit', () => {
  const feed = { run: { id: '3', number: 3, url: 'u3', commit: 'c3' }, generatedAt: 't3', window: { wallMs: 900 }, totals: { tests: 2, passed: 2, failed: 0, skipped: 0, flaky: 0, durationMs: 10 } };
  const previous = { schema: HISTORY_SCHEMA, runs: [{ id: '1' }, { id: '2' }, { id: '3', number: 3, stale: true }] };
  const history = appendHistory(previous, feed, 2);
  assert.equal(history.schema, HISTORY_SCHEMA);
  assert.deepEqual(history.runs.map((run) => run.id), ['2', '3']);
  assert.equal(history.runs[1].wallMs, 900);
  assert.equal(history.runs[1].stale, undefined);
  assert.deepEqual(appendHistory(null, feed).runs.map((run) => run.id), ['3']);
});

test('CLI writes the feed and the history, and fails when no results exist', () => {
  const root = fixture();
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'run-feed-empty-'));
  test.after(() => { fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(empty, { recursive: true, force: true }); });

  writeJson(root, 'previous-history.json', { schema: HISTORY_SCHEMA, runs: [{ id: 'old', number: 1 }] });
  execFileSync(process.execPath, [script.pathname, 'out/run', '--previous-history', 'previous-history.json'], { cwd: root, stdio: 'pipe', env: { ...process.env, ...env } });
  const feed = JSON.parse(fs.readFileSync(path.join(root, 'out/run/latest.json'), 'utf8'));
  const history = JSON.parse(fs.readFileSync(path.join(root, 'out/run/history.json'), 'utf8'));
  assert.equal(feed.totals.tests, 8);
  assert.deepEqual(history.runs.map((run) => run.id), ['old', '123']);

  assert.throws(() => execFileSync(process.execPath, [script.pathname], { cwd: empty, stdio: 'pipe' }));
});
