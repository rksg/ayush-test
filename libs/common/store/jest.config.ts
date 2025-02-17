module.exports = {
  displayName: 'common-store',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'common-store.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/common/store',
  collectCoverageFrom: []
}
