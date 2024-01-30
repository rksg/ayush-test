module.exports = {
  displayName: 'analytics-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/analytics/components',
  coverageThreshold: {
    global: {
      statements: 99.91,
      branches: 96.96,
      functions: 99.94,
      lines: 99.91
    }
  }
}
