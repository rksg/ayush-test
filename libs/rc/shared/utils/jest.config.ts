module.exports = {
  displayName: 'rc-utils',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'rc-utils.xml' }]
  ],
  coverageDirectory: '../../../../coverage/libs/rc/shared/utils',
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 20,
      functions: 30,
      lines: 30
    }
  }
}
