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
      statements: 68.5,
      branches: 57.5,
      functions: 61,
      lines: 69
    }
  }
}
