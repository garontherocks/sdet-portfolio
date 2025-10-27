const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'e2e/**/*.cy.js',
    supportFile: 'support/e2e.js',
    setupNodeEvents(on, config) {
      // Allure results writer
      require('@shelex/cypress-allure-plugin/writer')(on, config)
      on('task', {
        log(_message) {
          return null
        }
      })
      return config
    },
  },

  reporter: require.resolve('mochawesome'),
  reporterOptions: {
    reportDir: 'reports/mochawesome',
    overwrite: false,
    html: true,
    json: true,
  },

  env: {
    allure: true,
    allureResultsPath: 'reports/allure-results',
    allureReuseAfterSpec: true,
  },
})
