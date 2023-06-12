module.exports = {
  displayName: 'ra',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/ra',
  coverageThreshold: {
    global: {
      statements: 100.0,
      branches: 100.0,
      functions: 100.0,
      lines: 100.0
    }
  }
}
