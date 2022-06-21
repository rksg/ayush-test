module.exports = {
  displayName: 'rc-wifi',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/rc-wifi',
  coverageThreshold: {
    global: {
      statements: 3.05,
      branches: 2.76,
      functions: 2.52,
      lines: 3.11
    }
  }
}
