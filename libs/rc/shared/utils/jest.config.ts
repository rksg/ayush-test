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
      statements: 57,
      branches: 47.5,
      functions: 48,
      lines: 57.3
    }
  }
}
