module.exports = {
  displayName: 'common-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/common/components',
  coverageThreshold: {
    global: {
      statements: 83.77,
      branches: 80.86,
      functions: 85.84,
      lines: 83.39
    }
  }
}
