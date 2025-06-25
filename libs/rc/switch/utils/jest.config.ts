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
      statements: 85,
      branches: 79,
      functions: 80,
      lines: 85
    }
  }
}
