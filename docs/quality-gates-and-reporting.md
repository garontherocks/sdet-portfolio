# Quality Gates and Reporting

- Dashboards: Allure for Playwright and Cypress. Mochawesome remains for Cypress.
- Quality gates: Lighthouse min scores (0.9), k6 thresholds, CI fails on breaches.

## Local Commands

- Cypress Allure
  - `npm run run --workspace=cypress`
  - `npm run report:allure:gen --workspace=cypress`
  - Open `cypress/reports/allure-report/index.html`

- Playwright Allure
  - `npm run test --workspace=playwright`
  - `npm run allure:generate --workspace=playwright`
  - `npm run allure:open --workspace=playwright`

- Lighthouse
  - `npm run lhci`
  - Fails if performance or accessibility score < 0.9

- k6 (smoke)
  - `npm run k6:smoke`
  - Fails if any request fails or p95 > 800ms

## CI Artifacts (GitHub Actions)

- Cypress
  - `cypress-mochawesome-report` (JSON/HTML)
  - `cypress-allure-results`, `cypress-allure-html`

- Playwright
  - `playwright-allure-results`, `playwright-allure-html`

Notes

- No UI style changes are performed; Tailwind colors and typography remain untouched.
- Scripts are minimal and reproducible across local/CI.
