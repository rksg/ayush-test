module.exports = {
  displayName: 'common-types',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'common-types.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/common/types',
  collectCoverageFrom: []
}
