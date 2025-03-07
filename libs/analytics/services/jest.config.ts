module.exports = {
  displayName: 'analytics-services',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'analytics-services.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/analytics/services',
  collectCoverageFrom: []
}
