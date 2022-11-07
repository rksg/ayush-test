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
      statements: 72,
      branches: 50,
      functions: 76,
      lines: 71
    }
  }
}
