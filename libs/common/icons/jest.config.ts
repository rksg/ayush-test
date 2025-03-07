module.exports = {
  displayName: 'common-icons',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'common-icons.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/common/icons',
  collectCoverageFrom: []
}
