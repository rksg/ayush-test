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
      statements: 99.7,
      branches: 96.5,
      functions: 99.6,
      lines: 99.7
    }
  }
}
