module.exports = {
  ci: {
    collect: {
      url: ['https://www.saucedemo.com/'],
      numberOfRuns: 1,
      isSinglePageApplication: false
    },
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }]
      }
    }
  }
}
