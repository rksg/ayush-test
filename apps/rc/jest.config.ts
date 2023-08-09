module.exports = {
  displayName: 'rc',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/rc',
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 64,
      functions: 73,
      lines: 75
    }
  }
}
