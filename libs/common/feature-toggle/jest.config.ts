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
      statements: 29.26,
      branches: 33.33,
      functions: 20,
      lines: 30
    }
  }
}
