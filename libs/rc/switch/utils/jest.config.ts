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
      statements: 67,
      branches: 55,
      functions: 59,
      lines: 67
    }
  }
}
