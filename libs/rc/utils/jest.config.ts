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
      statements: 7.4,
      branches: 11,
      functions: 9,
      lines: 7.5
    }
  }
}
