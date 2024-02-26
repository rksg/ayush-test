module.exports = {
  displayName: 'common-user',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/common/user',
  coverageThreshold: {
    global: {
      statements: 75.7,
      branches: 95,
      functions: 54,
      lines: 72.9
    }
  }
}
