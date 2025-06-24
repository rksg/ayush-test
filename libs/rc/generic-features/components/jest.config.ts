module.exports = {
  displayName: 'rc-generic-features-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/rc/generic-features/components',
  coverageThreshold: {
    global: {
      statements: 95.2,
      branches: 83.2,
      functions: 92.5,
      lines: 95.0
    }
  }
}
