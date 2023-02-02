module.exports = {
  displayName: 'reports',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/reports',
  coverageThreshold: {
    global: {
      statements: 91.50,
      branches: 75,
      functions: 85,
      lines: 93
    }
  }
}
