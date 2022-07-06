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
      statements: 82.6,
      branches: 50,
      functions: 81.81,
      lines: 80.95
    }
  }
}
