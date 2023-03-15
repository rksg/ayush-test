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
      statements: 84,
      branches: 62,
      functions: 89,
      lines: 83
    }
  }
}
