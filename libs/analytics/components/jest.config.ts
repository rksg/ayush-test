module.exports = {
  displayName: 'analytics-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/analytics/components',
  coverageThreshold: {
    global: {
      statements: 99.92,
      branches: 97.08,
      functions: 99.83,
      lines: 99.94
    }
  }
}
