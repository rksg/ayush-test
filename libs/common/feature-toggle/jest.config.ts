module.exports = {
  displayName: 'common-feature-toggle',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'common-feature-toggle.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/common/feature-toggle',
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 72,
      functions: 83,
      lines: 97
    }
  }
}
