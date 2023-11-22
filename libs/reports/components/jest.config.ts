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
      statements: 97,
      branches: 76,
      functions: 94,
      lines: 97
    }
  }
}
