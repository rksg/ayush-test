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
      statements: 91.9,
      branches: 86.4,
      functions: 84.9,
      lines: 92.1
    }
  }
}
