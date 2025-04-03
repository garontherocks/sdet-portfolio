# SDET Portfolio – Cypress (JavaScript) & Playwright (TypeScript)

![Cypress Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/cypress-tests.yml/badge.svg)
![Playwright Tests](https://github.com/garontherocks/sdet-portfolio/actions/workflows/playwright-tests.yml/badge.svg)

This is my public SDET portfolio project built with JavaScript using [Cypress](https://www.cypress.io/), and TypeScript using [Playwright](https://playwright.dev/), targeting the demo website [SauceDemo](https://www.saucedemo.com/). The goal is to showcase best practices in UI and API automation testing for potential employers and collaborators.

While the initial focus is on UI and API testing, the project is structured to grow and include performance, stress, visual testing and reporting in future updates.

## Project Structure

```
sdet-portfolio/
├── cypress/
│   ├── e2e/                           # End-to-end test specs
│   │   ├── api/                       # API-related tests
│   │   └── ui/
│   │       ├── cart/                  # Cart-related tests
│   │       └── login/                 # Login-related tests
│   ├── page-objects/                  # Page Object Model structure
│   ├── support/                       # Setup logic
│   └── test-data/                     # Test data (e.g. login credentials)
├── playwright/
│   ├── e2e/                           # End-to-end test specs
│   │   ├── api/                       # API-related tests
│   │   └── ui/
│   │       ├── cart/                  # Cart-related tests
│   │       └── login/                 # Login-related tests
│   ├── page-objects/                  # Page Object Model structure
│   └── test-data/                     # Test data (e.g. login credentials)
└── README.md                          # Project documentation (this file)
```

## What’s Covered

- Cypress Login flow (valid/invalid), Cart functionality coverage (add, remove, total, checkout) and API validation tests
- Playwright Login flow (valid/invalid), Cart functionality coverage (add, remove, total, checkout) and API validation tests
- GitHub Actions integration for Cypress and Playwright (runs on every push & PR)
- Page Object Model (POM) architecture
- Test data separation
- Assertions on login feedback and UI elements

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
git clone https://github.com/garontherocks/sdet-portfolio.git
cd sdet-portfolio
npm install
```

### Run Tests (Cypress GUI)

```bash
npm run open --workspace=cypress
```

### Run Tests (Cypress Headless)

```bash
npm run run --workspace=cypress
```

### Run Tests (Playwright Headless)

```bash
npm run test --workspace=playwright
```

## Design Principles

- Test code is organized by feature (e.g. login, cart)
- Page Object Model (POM) abstracts UI interactions
- Test data is centralized in reusable modules
- File names and folder structure follow consistent conventions

## Best Practices Demonstrated

- Modular folder structure
- Use of POM for reusability and readability
- Clear test case naming and separation of concerns
- Readable, self-contained specs
- Avoiding hardcoded values via centralized test data

## Roadmap

This portfolio is being developed iteratively to showcase practical skills and good practices in QA Automation.

### Phase 1 – Core Coverage (Completed)

- ✅ Cypress and Playwright test coverage for login and cart functionality.
- ✅ API tests using Cypress and Playwright against the ReqRes service.
- ✅ Centralized Page Object Model architecture and reusable test data.
- ✅ Project organized using npm workspaces.

### Phase 2 – CI/CD, Reporting and Tooling (In Progress)

- ✅ GitHub Actions integration for Cypress and Playwright (triggered on every push and pull request).
- Integration with Allure for test reporting.
- Visual testing setup with Percy.
- Performance testing using Lighthouse CI.
- Load/stress testing with k6 or Gatling.

## License

MIT
