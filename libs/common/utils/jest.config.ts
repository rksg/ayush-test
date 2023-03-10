module.exports = {
  displayName: 'common-utils',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/common/utils',
  coverageThreshold: {
    global: {
      statements: 86,
      branches: 67,
      functions: 90,
      lines: 86
    }
  }
}
