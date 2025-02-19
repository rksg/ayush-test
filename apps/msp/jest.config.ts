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
      statements: 94,
      branches: 89.9,
      functions: 90,
      lines: 95
    }
  }
}
