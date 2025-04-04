import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    setupNodeEvents(on, _config) {
      on('task', {
        log(_message) {
          return null;
        }
      });
    },
    specPattern: 'e2e/**/*.cy.js',
    supportFile: 'support/e2e.js'
  }
});
