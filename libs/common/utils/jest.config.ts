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
      statements: 87,
      branches: 70,
      functions: 91,
      lines: 86
    }
  }
}
