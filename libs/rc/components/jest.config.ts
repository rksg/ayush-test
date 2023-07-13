module.exports = {
  displayName: 'rc-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/rc/components',
  coverageThreshold: {
    global: {
      statements: 86,
      branches: 78,
      functions: 84,
      lines: 87
    }
  }
}
