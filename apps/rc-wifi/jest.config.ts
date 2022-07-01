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
      statements: 73.66,
      branches: 66.66,
      functions: 66,
      lines: 73.96
    }
  }
}
