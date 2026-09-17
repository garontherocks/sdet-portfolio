# Test Architecture

This repository demonstrates a compact quality engineering system against two public test services:

- SauceDemo for browser, visual and synthetic performance checks.
- ReqRes anonymous demo endpoints for API contract examples.

## Test layers

| Layer | Tooling | Purpose |
|---|---|---|
| Static analysis | ESLint, TypeScript | Catch syntax, style and type defects before execution |
| API | Cypress, Playwright, Newman | Validate success and negative contracts against the anonymous demo API |
| UI | Cypress, Playwright | Validate critical login, cart and checkout behavior |
| Visual | Percy | Detect deterministic UI regressions in selected Chromium scenarios |
| Synthetic audit | Lighthouse CI | Track third-party page performance and accessibility |
| Load | k6 | Exercise smoke, load and opt-in stress profiles with native thresholds |
| AI-first evidence | Versioned JSON contract | Verify the reviewed guarantees of the companion agent project |

## CI evidence flow

Individual workflows preserve focused status badges and diagnostic artifacts. `reports-hub.yml` runs a representative Chromium quality path in one workspace so the aggregator can read actual Cypress, Playwright, Lighthouse and k6 output. It refuses to publish a green quality result when required evidence is absent.

The companion AI-first agent publishes a contract and adversarial report from its own workflow. This repository keeps and validates a reviewed contract snapshot instead of downloading and executing cross-repository artifacts or sharing a personal access token. The agent repository remains authoritative; updates become portfolio claims only through a reviewed change here.

External demo services can introduce noise. Thresholds are intentionally conservative, every failure retains evidence, and the stress scenario is manual to avoid placing unintended sustained load on public infrastructure.

## Secrets

`PERCY_TOKEN` is required only for visual workflows. The ReqRes examples use its anonymous, rate-limited demo endpoints and assert one intended contract rather than accepting alternate statuses.
