module.exports = {
  displayName: 'common-feature-toggle',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/common/feature-toggle',
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 76,
      functions: 80,
      lines: 95
    }
  }
}
