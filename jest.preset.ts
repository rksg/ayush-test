process.env.TZ = 'UTC'
const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    '^antd/es/(.*)$': `${__dirname}/node_modules/antd/lib/$1`
  },
  transform: {
    '\\.svg$': `${__dirname}/tools/tests/svgrTransformer.js`
  },
  coverageReporters: [ 'lcov', 'text-summary' ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/__tests__/**',
    '!<rootDir>/src/**/stories.tsx',
    '!<rootDir>/src/**/stories/**',
    '!<rootDir>/src/components/StepsFormProAnt/*',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/setupProxy.js',
    '!<rootDir>/src/theme/modify-vars.js'
  ],
  setupFilesAfterEnv: [`${__dirname}/jest.setup.js`, 'jest-canvas-mock']
}
