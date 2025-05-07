module.exports = {
  displayName: 'common-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'common-components.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/common/components',
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 95,
      functions: 96.9,
      lines: 98
    }
  }
}
