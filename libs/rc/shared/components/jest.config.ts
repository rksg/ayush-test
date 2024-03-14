module.exports = {
  displayName: 'rc-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/rc/shared/components',
  coverageThreshold: {
    global: {
      statements: 83,
      branches: 71,
      functions: 82,
      lines: 84
    }
  }
}
