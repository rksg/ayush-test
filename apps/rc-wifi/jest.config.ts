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
      statements: 55.81,
      branches: 43.53,
      functions: 53.69,
      lines: 56.38
    }
  }
}
