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
      statements: 5.21,
      branches: 4.9,
      functions: 4,
      lines: 5.3
    }
  }
}
