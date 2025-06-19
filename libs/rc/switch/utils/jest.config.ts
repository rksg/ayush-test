module.exports = {
  displayName: 'rc-switch-utils',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/rc/switch/utils',
  coverageThreshold: {
    global: {
      statements: 68,
      branches: 57,
      functions: 60,
      lines: 68.5
    }
  }
}
