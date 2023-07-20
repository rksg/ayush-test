module.exports = {
  displayName: 'msp',
  preset: '../../jest.preset.ts',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/msp',
  coverageThreshold: {
    global: {
      statements: 71,
      branches: 58,
      functions: 68,
      lines: 72
    }
  }
}
