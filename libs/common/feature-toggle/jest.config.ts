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
      statements: 50,
      branches: 32,
      functions: 40,
      lines: 51
    }
  }
}
