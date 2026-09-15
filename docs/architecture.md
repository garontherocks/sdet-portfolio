# Test Architecture

This repository demonstrates a compact quality engineering system against two public test services:

- SauceDemo for browser, visual and synthetic performance checks.
- ReqRes for authenticated API contract examples.

## Test layers

| Layer | Tooling | Purpose |
|---|---|---|
| Static analysis | ESLint, TypeScript | Catch syntax, style and type defects before execution |
| API | Cypress, Playwright, Newman | Validate authenticated success and negative contracts |
| UI | Cypress, Playwright | Validate critical login, cart and checkout behavior |
| Visual | Percy | Detect deterministic UI regressions in selected Chromium scenarios |
| Synthetic audit | Lighthouse CI | Track third-party page performance and accessibility |
| Load | k6 | Exercise smoke, load and opt-in stress profiles with native thresholds |

## CI evidence flow

Individual workflows preserve focused status badges and diagnostic artifacts. `reports-hub.yml` runs a representative Chromium quality path in one workspace so the aggregator can read actual Cypress, Playwright, Lighthouse and k6 output. It refuses to publish a green quality result when required evidence is absent.

External demo services can introduce noise. Thresholds are intentionally conservative, every failure retains evidence, and the stress scenario is manual to avoid placing unintended sustained load on public infrastructure.

## Secrets

`REQRES_API_KEY` is required for authenticated API suites. `PERCY_TOKEN` is required only for visual workflows. Workflows pass secrets explicitly; tests never turn a missing credential into a passing alternate assertion.
