module.exports = {
  displayName: 'rc-services',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'rc-services.xml' }]
  ],
  coverageDirectory: '../../../../coverage/libs/rc/shared/services',
  collectCoverageFrom: []
}
