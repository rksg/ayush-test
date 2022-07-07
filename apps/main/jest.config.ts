module.exports = {
  displayName: 'main',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/main',
  coverageThreshold: {
    global: {
      statements: 88.23,
      branches: 37.5,
      functions: 86.95,
      lines: 87.5
    }
  }
}
