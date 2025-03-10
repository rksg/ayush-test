module.exports = {
  displayName: 'ra',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'ra.xml' }]
  ],
  coverageDirectory: '../../coverage/apps/ra',
  coverageThreshold: {
    global: {
      statements: 100.0,
      branches: 100.0,
      functions: 100.0,
      lines: 100.0
    }
  }
}
