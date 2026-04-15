module.exports = {
  ci: {
    collect: {
      staticDistDir: './build',
      numberOfRuns: 1,
      url: ['http://localhost/giris'],
    },
    assert: {
      assertions: {
        'categories:performance':     ['warn',  { minScore: 0.7 }],
        'categories:accessibility':   ['warn',  { minScore: 0.8 }],
        'categories:best-practices':  ['warn',  { minScore: 0.8 }],
        'categories:seo':             ['warn',  { minScore: 0.8 }],
        'first-contentful-paint':     ['warn',  { maxNumericValue: 3000 }],
        'interactive':                ['warn',  { maxNumericValue: 5000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
