module.exports = {
  displayName: 'analytics',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/analytics',
  coverageThreshold: {
    global: {
      statements: 78.26,
      branches: 50,
      functions: 72.72,
      lines: 76.19
    }
  }
}
