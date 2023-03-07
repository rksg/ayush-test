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
      statements: 67.69,
      branches: 90,
      functions: 48.38,
      lines: 61.81
    }
  }
}
