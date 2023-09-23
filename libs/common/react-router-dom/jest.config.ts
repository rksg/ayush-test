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
      statements: 97,
      branches: 100,
      functions: 90,
      lines: 100
    }
  }
}
