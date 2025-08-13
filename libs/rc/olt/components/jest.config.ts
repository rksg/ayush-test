module.exports = {
  displayName: 'rc-olt-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/rc/olt/components',
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 94,
      functions: 89,
      lines: 97
    }
  }
}
