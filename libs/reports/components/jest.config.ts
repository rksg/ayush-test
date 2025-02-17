module.exports = {
  displayName: 'reports-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'reports-components.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/reports/components',
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 75,
      functions: 89,
      lines: 94
    }
  }
}
