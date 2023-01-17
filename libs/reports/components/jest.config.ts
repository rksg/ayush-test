module.exports = {
  displayName: 'reports-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/reports/components',
  coverageThreshold: {
    global: {
      statements: 61.53,
      branches: 42.85,
      functions: 40,
      lines: 66.66
    }
  }
}
