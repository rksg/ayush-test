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
      statements: 99.5,
      branches: 90.5,
      functions: 99.3,
      lines: 90.5
    }
  }
}
