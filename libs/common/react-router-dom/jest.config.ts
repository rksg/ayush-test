module.exports = {
  displayName: 'ui-react-router-dom',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'ui-react-router-dom.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/common/react-router-dom',
  coverageThreshold: {
    global: {
      statements: 21,
      branches: 0,
      functions: 23,
      lines: 20
    }
  }
}
