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
      statements: 67.53,
      branches: 71.42,
      functions: 84.61,
      lines: 67.1
    }
  }
}
