import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildFeed, FEED_SCHEMA, normaliseStatus } from './build-run-feed.js';

const script = new URL('./build-run-feed.js', import.meta.url);

function writeJson(root, relativePath, value) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'run-feed-'));
  // Playwright UI test that failed once and passed on retry.
  writeJson(root, 'playwright/allure-results/a-result.json', {
    historyId: 'login', name: 'logs in with valid user', status: 'failed', fullName: 'ui/login/login.spec.ts:5:7',
    labels: [{ name: 'suite', value: 'Login' }], time: { start: 0, stop: 900, duration: 900 },
  });
  writeJson(root, 'playwright/allure-results/b-result.json', {
    historyId: 'login', name: 'logs in with valid user', status: 'passed', fullName: 'ui/login/login.spec.ts:5:7',
    labels: [{ name: 'suite', value: 'Login' }], time: { start: 1000, stop: 1800, duration: 800 },
  });
  // Playwright API test, broken status.
  writeJson(root, 'playwright/allure-results/c-result.json', {
    historyId: 'create', name: 'creates a user', status: 'broken', fullName: 'api/create-user.spec.ts:3:5',
    labels: [], time: { start: 0, stop: 120 },
  });
  writeJson(root, 'cypress/reports/mochawesome/merged.json', {
    stats: { tests: 3 },
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

test('normalises Allure and Mochawesome statuses', () => {
  assert.equal(normaliseStatus('passed'), 'passed');
  assert.equal(normaliseStatus('pending'), 'skipped');
  assert.equal(normaliseStatus('skipped'), 'skipped');
  assert.equal(normaliseStatus('broken'), 'failed');
  assert.equal(normaliseStatus(undefined), 'failed');
});

test('builds per-suite results, keeps the last attempt and splits UI from API', async () => {
  const root = fixture();
  test.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const env = { GITHUB_RUN_ID: '123', GITHUB_RUN_NUMBER: '45', GITHUB_SHA: 'abc123', GITHUB_REF_NAME: 'main', GITHUB_REPOSITORY: 'garontherocks/sdet-portfolio' };
  const feed = await buildFeed(root, env, new Date('2026-11-07T00:00:00Z'));

  assert.equal(feed.schema, FEED_SCHEMA);
  assert.equal(feed.generatedAt, '2026-11-07T00:00:00.000Z');
  assert.equal(feed.run.url, 'https://github.com/garontherocks/sdet-portfolio/actions/runs/123');
  assert.equal(feed.run.number, 45);
  assert.deepEqual(feed.suites.map((item) => item.id), ['playwright-ui', 'playwright-api', 'cypress-ui', 'cypress-api', 'genai-evals']);

  const [pwUi, pwApi, cyUi, cyApi, ai] = feed.suites;
  assert.deepEqual(pwUi.tests, [{ name: 'logs in with valid user', group: 'Login', status: 'passed', durationMs: 800, retries: 1 }]);
  assert.equal(pwUi.totals.flaky, 1);
  assert.equal(pwApi.tests[0].status, 'failed');
  assert.equal(pwApi.tests[0].durationMs, 120);
  assert.deepEqual(cyUi.tests.map((item) => [item.group, item.status]), [['Cart', 'passed'], ['Cart › Empty', 'skipped']]);
  assert.equal(cyApi.totals.passed, 1);
  assert.deepEqual(ai.tests.map((item) => item.group), ['Failure classification', 'Prompt-injection cases']);
  assert.equal(ai.target, 'mock');

  assert.deepEqual(feed.totals, { tests: 7, passed: 4, failed: 2, skipped: 1, flaky: 1, durationMs: 2725 });
  assert.deepEqual(feed.checks, { lighthouse: { performance: 0.95 }, k6: { httpP95Ms: 4.4 } });
});

test('CLI writes the feed and fails when no results exist', () => {
  const root = fixture();
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'run-feed-empty-'));
  test.after(() => { fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(empty, { recursive: true, force: true }); });

  execFileSync(process.execPath, [script.pathname], { cwd: root, stdio: 'pipe' });
  const feed = JSON.parse(fs.readFileSync(path.join(root, 'reports/dashboards/run/latest.json'), 'utf8'));
  assert.equal(feed.totals.tests, 7);

  assert.throws(() => execFileSync(process.execPath, [script.pathname], { cwd: empty, stdio: 'pipe' }));
});
