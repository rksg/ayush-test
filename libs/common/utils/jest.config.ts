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
      statements: 91,
      branches: 73,
      functions: 96,
      lines: 92
    }
  }
}
