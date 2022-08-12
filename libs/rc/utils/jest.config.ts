module.exports = {
  displayName: 'rc-utils',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/rc/utils',
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 29,
      functions: 45,
      lines: 41
    }
  }
}
