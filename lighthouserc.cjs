module.exports = {
  ci: {
    collect: {
      url: ['https://www.saucedemo.com/'],
      numberOfRuns: 3,
      isSinglePageApplication: false
    },
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      aggregationMethod: 'median-run',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }]
      }
    }
  }
};
