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
      statements: 80.5,
      branches: 67.5,
      functions: 81,
      lines: 80.5
    }
  }
}
