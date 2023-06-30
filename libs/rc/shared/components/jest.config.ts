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
      statements: 89,
      branches: 80,
      functions: 85,
      lines: 89
    }
  }
}
