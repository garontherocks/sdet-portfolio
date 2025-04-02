const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          return null;
        }
      });
    },
    specPattern: 'e2e/**/*.cy.js',
    supportFile: 'support/e2e.js'
  }
});
