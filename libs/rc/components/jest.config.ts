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
      statements: 89,
      branches: 81,
      functions: 85,
      lines: 89
    }
  }
}
