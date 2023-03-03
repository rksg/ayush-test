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
      statements: 92,
      branches: 78,
      functions: 87,
      lines: 96
    }
  }
}
