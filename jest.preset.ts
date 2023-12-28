process.env.TZ = 'UTC'
const nxPreset = require('@nrwl/jest/preset')

const esModules = [
  'd3',
  'd3-array',
  'csv-stringify',
  'InternMap',
  'react-dnd',
  'dnd-core',
  '@react-dnd',
  'escape-string-regexp'
].join('|')

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    "^csv-stringify/browser/esm/sync": "node_modules/csv-stringify/dist/umd/sync.js",
    '^antd/es/(.*)$': `${__dirname}/node_modules/antd/lib/$1`,
    '^d3-(.*)$': `d3-$1/dist/d3-$1`
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  transform: {
    [`(${esModules}).+\\.[tj]sx?$`]: ['babel-jest', { presets: ['@nrwl/react/babel'] }],
    '\\.svg$': `${__dirname}/tools/tests/svgrTransformer.js`,
    '\\.(png|jpg|jpeg|webp)$': `${__dirname}/tools/tests/imagerTransformer.js`
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
