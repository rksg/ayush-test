const nxPreset = require('@nrwl/jest/preset');

module.exports = {
  ...nxPreset,
  coverageReporters: [ 'lcov' ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/stories.{ts,tsx}',
    '!src/**/stories/*'
  ]
};
