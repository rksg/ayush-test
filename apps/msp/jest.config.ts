module.exports = {
  displayName: 'msp',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'msp.xml' }]
  ],
  coverageDirectory: '../../coverage/apps/msp',
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 89,
      functions: 91,
      lines: 95
    }
  }
}
