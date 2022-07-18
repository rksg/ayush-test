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
      statements: 86.58,
      branches: 83.41,
      functions: 88.46,
      lines: 86.45
    }
  }
}
