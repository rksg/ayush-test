const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    '^antd/es/(.*)$': `${__dirname}/node_modules/antd/lib/$1`
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/stories.tsx',
    '!<rootDir>/src/**/stories/*',
    '!<rootDir>/src/theme/modify-vars.js'
  ],
  setupFilesAfterEnv: [
    'whatwg-fetch',
    '@testing-library/jest-dom',
    `${__dirname}/jest.setup.js`
  ]
}
