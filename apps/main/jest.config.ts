module.exports = {
  displayName: 'main',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'main.xml' }]
  ],
  coverageDirectory: '../../coverage/apps/main',
  coverageThreshold: {
    global: {
      statements: 86.5,
      branches: 73,
      functions: 83,
      lines: 87
    }
  }
}
