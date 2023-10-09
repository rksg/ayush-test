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
      statements: 91,
      branches: 65,
      functions: 85,
      lines: 91
    }
  }
}
