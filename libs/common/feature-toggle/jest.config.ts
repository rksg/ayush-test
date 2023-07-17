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
      statements: 29.41,
      branches: 41.66,
      functions: 20,
      lines: 30.3
    }
  }
}
