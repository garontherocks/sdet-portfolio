# SDET Portfolio – Cypress (JavaScript) & Playwright (TypeScript)

[![Cypress Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/cypress-tests.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/cypress-tests.yml)
[![Playwright Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/playwright-tests.yml)
[![Percy (Cypress)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-cypress.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-cypress.yml)
[![Percy (Playwright)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-playwright.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/percy-playwright.yml)
[![k6 Performance](https://github.com/garontherocks/sdet-portfolio/actions/workflows/perf-k6.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/perf-k6.yml)
[![Lighthouse CI](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lighthouse.yml)
[![Reports Hub](https://github.com/garontherocks/sdet-portfolio/actions/workflows/reports-hub.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/reports-hub.yml)
[![Lint](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lint.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lint.yml)
[![Postman CI](https://github.com/garontherocks/sdet-portfolio/actions/workflows/postman-tests.yml/badge.svg)](https://github.com/garontherocks/sdet-portfolio/actions/workflows/postman-tests.yml)

This public SDET portfolio demonstrates best practices using [Cypress](https://www.cypress.io/) with JavaScript, and [Playwright](https://playwright.dev/) with TypeScript. Tests target the demo website [SauceDemo](https://www.saucedemo.com/) and cover UI and API automation workflows. The project evolves iteratively to include performance, stress, visual testing, reporting, and CI/CD.

See Architecture and Contributing:
- docs/architecture.md
- CONTRIBUTING.md

## Project Structure

```
sdet-portfolio/
├── cypress/
│   ├── e2e/                           # UI & API test specs (Cypress)
│   ├── page-objects/                  # Page Object Model
│   ├── support/                       # Custom logic and setup
│   └── test-data/                     # Reusable test data
├── playwright/
│   ├── e2e/                           # UI & API test specs (Playwright)
│   ├── page-objects/                  # Page Object Model
│   └── test-data/                     # Reusable test data
├── .github/workflows/                 # GitHub Actions CI pipelines
└── README.md                          # Project documentation (this file)
```

## What’s Covered

- Full coverage for login, cart, and API flows (Cypress & Playwright)
- Page Object Model architecture
- Centralized, reusable test data
- CI pipelines for Cypress, Playwright, and ESLint
- Pre-commit validation using Husky + lint-staged

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Install Dependencies

```bash
git clone https://github.com/garontherocks/sdet-portfolio.git
cd sdet-portfolio
npm install
```

### Run Tests

```bash
npm run open --workspace=cypress        # Cypress UI mode
npm run run --workspace=cypress         # Cypress headless
npm run test --workspace=playwright     # Playwright headless
```

## 📋 Reporting

### Cypress + Mochawesome
![Cypress report](https://img.shields.io/badge/report-mochawesome-blue)

- `npm run run --workspace=cypress`  
- `npm run report:merge --workspace=cypress`  
- `npm run report:gen   --workspace=cypress`  
- Open `cypress/reports/mochawesome/html/index.html`

### Playwright + Allure
![Allure report](https://img.shields.io/badge/report-allure-red)

- `npm run test --workspace=playwright`  
- `npm run allure:generate --workspace=playwright`  
- `npm run allure:open     --workspace=playwright`  

### Lighthouse CI (Performance Testing)
![Lighthouse](https://img.shields.io/badge/report-lighthouse-yellow)

- `npm run lhci`  
- Lighthouse analyzes the public site [SauceDemo](https://www.saucedemo.com)  
- Reports are uploaded to temporary Google Cloud links (printed in terminal)  
- Configuration via `lighthouserc.js`

## Visual Testing (Percy)

- Percy integration enabled for Cypress and Playwright test cases.
- Visual snapshots are taken using percySnapshot().
- Requires valid PERCY_TOKEN in CI (configured in GitHub Secrets).
- Run visual tests locally (Cypress):

```bash
npx percy exec -- npx cypress run
```

- Run visual tests locally (Playwright):

```bash
npm run percy:playwright --workspace=playwright
```

- Percy build results are available at [percy.io](https://percy.io)

## 🚀 Performance Testing (k6)

k6 integration enabled for load and smoke testing.

Performance test scripts are stored under `playwright/performance`.

Run manually:

```bash
k6 run performance/smoke.test.js
```

Executed automatically via GitHub Actions on push/PR.

## Code Quality & Linting

- ESLint checks run locally and in CI (GitHub Actions).
- Pre-commit hooks automatically fix staged issues with lint-staged.

Run manually:

```bash
npm run lint                            # Analyze all .js and .ts files
npm run lint:fix                        # Auto-fix fixable issues
```

## Practices & Structure

- Feature-based folder organization (login, cart, etc.)
- Clean Page Object Model abstraction
- DRY test logic via reusable data and utilities
- Clear test naming and assertions

## Tooling Overview

| Tool        | Purpose                     |
|-------------|-----------------------------|
| Cypress     | UI + API testing            |
| Playwright  | UI + API testing            |
| Allure      | Test reporting (Playwright) |
| Mochawesome | Test reporting (Cypress)    |
| Lighthouse  | Performance audits          |
| Percy       | Visual regression testing   |
| ESLint      | Code quality                |
| Husky       | Pre-commit enforcement      |
| k6          | Load/Stress Test            |

## Roadmap

This portfolio is being developed iteratively to showcase practical skills and good practices in QA Automation.

### Phase Progress

- [x] Phase 1 – Core Coverage
- [x] Phase 2 – CI/CD, Reporting and Tooling
- [ ] Phase 3 – Orchestration & Continuous Quality

### Phase 1 – Core Coverage (Completed)

- ✅ Cypress and Playwright test coverage for login and cart functionality.
- ✅ API tests using Cypress and Playwright against the ReqRes service.
- ✅ Centralized Page Object Model architecture and reusable test data.
- ✅ Project organized using npm workspaces.

### Phase 2 – CI/CD, Reporting and Tooling (Completed)

- ✅ GitHub Actions integration for Cypress, Playwright, and Linting (triggered on every push and pull request).
- ✅ Integration with Mochawesome (Cypress) and Allure (Playwright) for test reporting.
- ✅ Performance testing using Lighthouse CI.
- ✅ Visual testing setup with Percy.
- ✅ Load/stress testing with k6.

### Phase 3 – Orchestration & Continuous Quality (In Progress)

- Report Centralization
- Pipeline Improvements
- Notifications & Insights
- Pull Request Validation

<!-- DUPLICATE CHECKLIST START (hidden to avoid duplication) -->
<!--
#### Phase Details (Checklist)

- Phase 1 – Core Coverage
  - [x] Login and cart UI coverage (Cypress/Playwright)
  - [x] ReqRes API tests (Cypress/Playwright)
  - [x] Page Object Model + shared test data
  - [x] npm workspaces structure

- Phase 2 – CI/CD, Reporting and Tooling
  - [x] GitHub Actions for Cypress, Playwright, ESLint
  - [x] Mochawesome (Cypress) and Allure (Playwright) reports
  - [x] Lighthouse CI performance checks
  - [x] Percy visual testing
  - [x] k6 load/stress tests

- Phase 3 – Orchestration & Continuous Quality
  - [ ] Centralized reports hub (Pages)
  - [ ] Pipeline improvements and gating
  - [ ] Notifications and insights
  - [ ] PR validation checks

## Learning Aids

- Postman examples: `postman/` (collection + environment with variables, pre‑request scripts, and tests). See `postman/README.md`.
- Cypress API tests: `cypress/e2e/api/*.cy.js` (status/body/headers assertions, CRUD basics).
- Microservices event‑driven testing: `docs/microservices/README.md` and example schema `docs/microservices/event-schemas/order.created.schema.json`.
- AWS basics cheat‑sheet: `docs/aws/README.md`.
- Mortgage basics (domain): `docs/domain/mortgage-basics.md`.

## License

MIT
