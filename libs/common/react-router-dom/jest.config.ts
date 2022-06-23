module.exports = {
  displayName: 'ui-react-router-dom',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/common/react-router-dom',
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 100,
      functions: 37.5,
      lines: 40
    }
  }
}
