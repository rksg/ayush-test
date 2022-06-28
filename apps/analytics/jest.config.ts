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
      statements: 86.04,
      branches: 66.66,
      functions: 80,
      lines: 84.61
    }
  }
}
