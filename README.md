# SDET Portfolio – Cypress (JavaScript) & Playwright (TypeScript)

This is my public SDET portfolio project built with JavaScript and [Cypress](https://www.cypress.io/), and TypeScript with [Playwright](https://playwright.dev/), targeting the demo website [SauceDemo](https://www.saucedemo.com/). The goal is to showcase best practices in UI and API automation testing for potential employers and collaborators.

While the initial focus is on UI and API testing, the project is structured to grow and include performance, stress, visual testing, reporting, and CI/CD integration in future updates.

## Project Structure

```
sdet-portfolio/
├── cypress/
│   ├── e2e/                  # End-to-end test specs
│   ├── fixtures/             # Test data (e.g. login credentials)
│   ├── page-objects/         # Page Object Model structure
│   └── support/              # Custom commands, setup logic
├── cypress.config.js         # Cypress configuration
├── package.json              # Project metadata and dependencies
└── README.md                 # Project documentation (this file)
```

## What’s Covered

- Login flow (valid and invalid credentials)
- Page Object Model (POM) architecture
- Custom Cypress commands
- Test data separation using fixtures
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
npx cypress open
```

### Run Tests (Headless)

```bash
npx cypress run
```

## Best Practices Demonstrated

- Modular folder structure
- Use of POM for reusability and readability
- Clear test case naming and separation of concerns
- Readable, self-contained specs
- Avoiding hardcoded values via fixtures

## License

MIT
