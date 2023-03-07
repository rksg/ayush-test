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
      functions: 61.81,
      lines: 48.38
    }
  }
}
