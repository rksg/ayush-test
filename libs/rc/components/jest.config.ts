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
      statements: 87,
      branches: 80,
      functions: 78,
      lines: 88
    }
  }
}
