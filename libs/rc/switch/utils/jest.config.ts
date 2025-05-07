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
      statements: 73,
      branches: 66,
      functions: 61,
      lines: 73
    }
  }
}
