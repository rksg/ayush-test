module.exports = {
  displayName: 'msp-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/rc/msp/components',
  coverageThreshold: {
    global: {
      statements: 67,
      branches: 51,
      functions: 60,
      lines: 68
    }
  }
}
