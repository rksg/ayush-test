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
      statements: 77,
      branches: 50,
      functions: 50,
      lines: 80
    }
  }
}
