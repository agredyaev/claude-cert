const repoName = (process.env.GITHUB_REPOSITORY || 'local/claude-cert').split('/').pop();
const base = process.env.SITE_BASE_HREF || `/${repoName}/`;
const origin = 'http://localhost:8099';

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node scripts/serve-docs.mjs 8099',
      startServerReadyPattern: 'Serving docs',
      url: [
        `${origin}${base}practical/en.html`,
        `${origin}${base}guides/en.html`,
        `${origin}${base}index.html`,
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'perf',
        formFactor: 'mobile',
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: 'practical/en\\.html$',
          assertions: {
            'resource-summary:document:size': ['warn', { maxNumericValue: 61440 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 1200 }],
            'total-blocking-time': ['warn', { maxNumericValue: 150 }],
            'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
          },
        },
        {
          matchingUrlPattern: '(guides/en|index)\\.html$',
          assertions: {
            'largest-contentful-paint': ['warn', { maxNumericValue: 1200 }],
            'total-blocking-time': ['warn', { maxNumericValue: 150 }],
          },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
