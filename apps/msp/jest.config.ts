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
      statements: 81.6,
      branches: 69.5,
      functions: 77.3,
      lines: 81.8
    }
  }
}
