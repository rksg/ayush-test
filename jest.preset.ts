const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    '^antd/es/(.*)$': `${__dirname}/node_modules/antd/lib/$1`
  },
  transform: {
    '\\.svg$': `${__dirname}/tools/tests/svgrTransformer.js`
  },
  coverageReporters: [ 'lcov', 'text-summary'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/stories.tsx',
    '!<rootDir>/src/**/stories/*',
    '!<rootDir>/src/theme/modify-vars.js'
  ],
  setupFilesAfterEnv: [`${__dirname}/jest.setup.js`]
}
