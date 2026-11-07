# Run feed contract (`run/latest.json`)

The Reports Hub workflow publishes the latest run of `main` to GitHub Pages:

| Path | Content |
| --- | --- |
| `/` | Quality dashboard |
| `/quality.json` | Aggregated quality metrics |
| `/allure/` | Allure report for the Playwright run |
| `/cypress/` | Mochawesome report for the Cypress run |
| `/run/latest.json` | Per-test feed described below |
| `/run/history.json` | Totals and test window of the last 20 runs of `main` |

`run/latest.json` is read by the **Quality run** page on
[victoraller.vercel.app](https://victoraller.vercel.app/quality-run), which replays the run test by test.
It is a public contract: a breaking change must bump `schema` and be released together with
the consumer.

## Shape (`schema: "sdet-portfolio/run-feed@1"`)

```jsonc
{
  "schema": "sdet-portfolio/run-feed@1",
  "generatedAt": "2026-11-07T01:52:38.891Z",   // ISO 8601
  "run": {
    "id": "42326072878", "number": 412, "attempt": 1,
    "workflow": "Reports Hub", "event": "push",
    "branch": "main", "commit": "<sha>", "repository": "garontherocks/sdet-portfolio",
    "url": "https://github.com/garontherocks/sdet-portfolio/actions/runs/42326072878"
  },
  "window": { "startedAt": "…", "finishedAt": "…", "wallMs": 94210 },   // first test start → last test end; may be null
  "totals": { "tests": 53, "passed": 53, "failed": 0, "skipped": 0, "flaky": 0, "durationMs": 61350 },
  "suites": [
    {
      "id": "playwright-ui",            // playwright-ui | playwright-api | cypress-ui | cypress-api | genai-evals
      "name": "Playwright UI",
      "tool": "Playwright + TypeScript",
      "command": "npx playwright test --project=chromium --project=firefox --project=webkit",
      "target": "Chromium, Firefox and WebKit",
      "targets": [ { "name": "Chromium", "totals": { "tests": 9, "passed": 9, "failed": 0, "skipped": 0, "flaky": 0, "durationMs": 9100 } } ],
      "areas": 7,                       // distinct groups (describe blocks)
      "totals": { "tests": 27, "passed": 27, "failed": 0, "skipped": 0, "flaky": 0, "durationMs": 30100 },
      "tests": [
        { "name": "logs in with valid user", "group": "Login", "target": "Chromium", "status": "passed", "durationMs": 812, "retries": 0 }
      ]
    }
  ],
  "environment": {
    "ui": "https://www.saucedemo.com", "api": "https://reqres.in",
    "browsers": ["Chromium", "Firefox", "WebKit", "Electron"],
    "runner": "Linux X64", "node": "v22.x", "pipeline": "GitHub Actions"
  },
  "checks": {
    "lighthouse": { "performance": 0.95, "accessibility": 1, "bestPractices": 0.81, "seo": 0.63 },
    "k6": { "httpP95Ms": 4.45 }
  },
  "reports": { "dashboard": "../", "allure": "../allure/", "cypress": "../cypress/", "quality": "../quality.json", "history": "./history.json" }
}
```

`run/history.json` (`schema: "sdet-portfolio/run-history@1"`) holds `runs`, newest last, at most 20:
`{ id, number, url, commit, generatedAt, wallMs, tests, passed, failed, skipped, flaky, durationMs }`.
Each run reads the published history before it builds, so history only grows on deployed (`main`) runs.

Rules consumers can rely on:

- `status` is always `passed`, `failed` or `skipped` (Allure `broken`/`unknown` map to `failed`).
- Only the last attempt of each test is listed; `retries` counts the earlier attempts, and a test
  that passed after a retry counts as `flaky` in `totals`.
- Suites with no results are omitted. `checks.*` may be `null` when that step did not produce output.
- `reports.*` are relative to the feed URL.
- New optional fields may be added without a schema bump; consumers must ignore fields they don't know.

The builder is `reports/aggregator/build-run-feed.js`, covered by `build-run-feed.test.js`
(`npm run test:aggregator`, run in the ESLint Check workflow). The consumer pins the schema and
has its own tests against a fixture produced by this builder.
