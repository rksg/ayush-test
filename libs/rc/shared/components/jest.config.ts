module.exports = {
  displayName: 'rc-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/rc/shared/components',
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 74,
      functions: 83,
      lines: 85.5
    }
  }
}
