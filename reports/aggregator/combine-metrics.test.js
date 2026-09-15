import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const aggregator = new URL('./combine-metrics.js', import.meta.url);

function writeJson(root, relativePath, value) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
}

test('deduplicates Playwright retry attempts and Cypress failure aliases', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-aggregator-'));
  test.after(() => fs.rmSync(root, { recursive: true, force: true }));

  writeJson(root, 'cypress/reports/mochawesome/merged.json', {
    stats: { tests: 2, passes: 1, failures: 1, failuresTotal: 1, pending: 0, duration: 200 },
  });
  writeJson(root, 'playwright/allure-results/attempt-1-result.json', {
    historyId: 'login-chromium', name: 'login', status: 'failed', time: { start: 1, stop: 101, duration: 100 },
  });
  writeJson(root, 'playwright/allure-results/attempt-2-result.json', {
    historyId: 'login-chromium', name: 'login', status: 'passed', time: { start: 102, stop: 202, duration: 100 },
  });

  execFileSync(process.execPath, [aggregator.pathname], { cwd: root, stdio: 'pipe' });
  const quality = JSON.parse(fs.readFileSync(path.join(root, 'reports/quality.json'), 'utf8'));

  assert.deepEqual(quality.suites.cypress, { tests: 2, passed: 1, failed: 1, skipped: 0, retries: 0 });
  assert.deepEqual(quality.suites.playwright, { tests: 1, passed: 1, failed: 0, skipped: 0, retries: 1 });
  assert.equal(quality.passRate, 0.6667);
  assert.equal(quality.summed_test_duration_seconds, 0.3);
});
