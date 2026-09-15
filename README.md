# SDET Portfolio — Cypress, Playwright and Continuous Quality

[![Cypress Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/cypress-tests.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/cypress-tests.yml)
[![Playwright Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/playwright-tests.yml)
[![Percy (Cypress)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-cypress.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-cypress.yml)
[![Percy (Playwright)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-playwright.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-playwright.yml)
[![k6 Performance](https://github.com/garontherocks/sdet-portfolio/actions/workflows/perf-k6.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/perf-k6.yml)
[![Lighthouse CI](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lighthouse.yml)
[![Reports Hub](https://github.com/garontherocks/sdet-portfolio/actions/workflows/reports-hub.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/reports-hub.yml)
[![Lint](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lint.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lint.yml)
[![Postman CI](https://github.com/garontherocks/sdet-portfolio/actions/workflows/postman-tests.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/postman-tests.yml)
[![GenAI Quality Evals](https://github.com/garontherocks/sdet-portfolio/actions/workflows/ai-quality.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/ai-quality.yml)

This public portfolio demonstrates practical SDET work with JavaScript, TypeScript and CI/CD. Browser scenarios target [SauceDemo](https://www.saucedemo.com/); anonymous demo API examples target [ReqRes](https://reqres.in/).

The emphasis is trustworthy evidence: tests assert one intended API contract, load profiles use native thresholds, and the quality dashboard fails when required source reports are absent.

## Coverage

| Area | Demonstrated coverage |
|---|---|
| Cypress UI | Standard and locked login, cart add/remove, subtotal and checkout |
| Playwright UI | Equivalent critical flows across Chromium, Firefox and WebKit |
| API | Anonymous demo create, list, read, update, delete and negative login examples |
| Reporting | Mochawesome, Allure and retained failure diagnostics |
| Visual | Focused deterministic cart snapshots with Percy |
| Web quality | Median-of-three Lighthouse performance and accessibility audits |
| Performance | k6 smoke and load gates, plus an opt-in stress profile |
| CI | Parallel Playwright shards, concurrency cancellation and a consolidated quality hub |
| GenAI quality | Structured failure triage, labeled evals, prompt-injection checks and review-only test generation |

See [architecture](docs/architecture.md) for the evidence flow and [contributing](CONTRIBUTING.md) for local validation.

## Repository structure

```text
cypress/                 Cypress UI/API tests, page objects and data
playwright/              Playwright UI/API tests, page objects and data
performance/             k6 smoke, load and stress scenarios
postman/                 Newman collection and environment
ai/                      Prompts, schemas, providers, evals and review-only generated plans
reports/                 Aggregator and dashboard
scripts/                 Quality gates and CI helpers
.github/workflows/       Focused checks and consolidated evidence workflow
```

## Getting started

Prerequisites: Node.js 22+ and npm.

```bash
git clone https://github.com/garontherocks/sdet-portfolio.git
cd sdet-portfolio
npm ci
npm run quality
```

### Cypress

```bash
npm run open --workspace=cypress
npm run run --workspace=cypress
npm run test:smoke --workspace=cypress
```

Mochawesome output is written under `cypress/reports/mochawesome`.

### Playwright

```bash
npx playwright install --with-deps
npm run test --workspace=playwright
npm run test:smoke --workspace=playwright
```

CI runs two shards across Chromium, Firefox and WebKit, then publishes one merged HTML/Allure report covering the complete run.

### Visual tests

```bash
npm run percy:exec --workspace=cypress
npm run percy:playwright --workspace=playwright
```

The visual workflows intentionally execute only the deterministic cart snapshot specs. They require `PERCY_TOKEN` and run for relevant pull requests and `main` changes.

The green GitHub Actions badges mean that the snapshot tests completed and Percy accepted the uploads. Percy review is intentionally separate: when Percy detects a visual difference, the baseline is updated only after a manual review in Percy. The external Percy review status should therefore not be configured as a required GitHub merge check for this portfolio.

### Lighthouse

```bash
npm run lhci
```

Configuration is in `lighthouserc.cjs`. Because SauceDemo is external, Lighthouse is treated as a synthetic audit with three runs and conservative stable gates.

### k6

```bash
npm run k6:smoke
npm run k6:load
npm run k6:stress
```

Smoke and load run in CI. Stress is an explicit manual workflow option to avoid sustained automatic load against a public service.

### GenAI quality engineering

```bash
npm run ai:test
npm run ai:eval
npm run ai:triage -- --input failure.log --test checkout
npm run ai:generate-tests -- --requirement ai/examples/checkout-requirement.md --id REQ-CHECKOUT-001
```

Ordinary CI uses a deterministic provider for reproducible, credential-free evaluation. An optional manually dispatched job uses OpenAI structured outputs when the `OPENAI_API_KEY` repository secret is configured. Model responses must satisfy strict JSON schemas; logs are sanitized and treated as untrusted evidence; generated tests always require human review. See [GenAI quality engineering](docs/genai-quality-engineering.md).

## Quality dashboard

`reports-hub.yml` generates Cypress, Playwright Chromium, Lighthouse and k6 evidence in the same job before aggregating it. The build fails if any required evidence is missing or violates its threshold. Successful `main` runs publish the current-run dashboard to GitHub Pages; historical trends are intentionally omitted until durable history is available.

## Roadmap status

- [x] Core UI and API examples
- [x] Cross-browser automation and reporting
- [x] Focused visual regression checks
- [x] Genuine smoke/load/stress profiles
- [x] Required-evidence quality gates
- [x] Consolidated quality dashboard
- [x] Provider-independent AI failure triage and structured outputs
- [x] Labeled AI evaluations and prompt-injection security tests
- [x] Review-only requirements-to-test generation
- [ ] Add a controlled first-party demo application for deeper contract and performance testing

## License

MIT
