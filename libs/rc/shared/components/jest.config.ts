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
      statements: 84,
      branches: 73,
      functions: 84,
      lines: 85
    }
  }
}
