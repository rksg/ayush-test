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
      statements: 100,
      branches: 95.35,
      functions: 100,
      lines: 100
    }
  }
}
