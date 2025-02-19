module.exports = {
  displayName: 'analytics-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'analytics-components.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/analytics/components',
  coverageThreshold: {
    global: {
      statements: 99.7,
      branches: 96.5,
      functions: 99.6,
      lines: 99.7
    }
  }
}
