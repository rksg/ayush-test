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
      statements: 100,
      branches: 95.7,
      functions: 100,
      lines: 100
    }
  }
}
