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
      statements: 88.37,
      branches: 66.66,
      functions: 85,
      lines: 87.17
    }
  }
}
