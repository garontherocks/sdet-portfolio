# SDET Portfolio – Cypress (JavaScript) & Playwright (TypeScript)

![Cypress Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/cypress-tests.yml/badge.svg)
![Playwright Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/playwright-tests.yml/badge.svg)
![Lint Status](https://github.com/garontherocks/sdet-portfolio/actions/workflows/lint.yml/badge.svg)

This public SDET portfolio demonstrates best practices using [Cypress](https://www.cypress.io/) with JavaScript, and [Playwright](https://playwright.dev/) with TypeScript. Tests target the demo website [SauceDemo](https://www.saucedemo.com/) and cover UI and API automation workflows. The project evolves iteratively to include performance, stress, visual testing, reporting, and CI/CD.

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

## Roadmap

This portfolio is being developed iteratively to showcase practical skills and good practices in QA Automation.

### Phase 1 – Core Coverage (Completed)

- ✅ Cypress and Playwright test coverage for login and cart functionality.
- ✅ API tests using Cypress and Playwright against the ReqRes service.
- ✅ Centralized Page Object Model architecture and reusable test data.
- ✅ Project organized using npm workspaces.

### Phase 2 – CI/CD, Reporting and Tooling (In Progress)

- ✅ GitHub Actions integration for Cypress, Playwright, and Linting (triggered on every push and pull request).
- Integration with Allure for test reporting.
- Visual testing setup with Percy.
- Performance testing using Lighthouse CI.
- Load/stress testing with k6 or Gatling.

## License

MIT
