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
      statements: 10,
      branches: 10,
      functions: 10,
      lines: 10
    }
  }
}
