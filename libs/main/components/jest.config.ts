module.exports = {
  displayName: 'main-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/main/components',
  coverageThreshold: {
    global: {
      statements: 67.5,
      branches: 37.5,
      functions: 73.33,
      lines: 64.86
    }
  }
}
