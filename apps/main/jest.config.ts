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
      statements: 87,
      branches: 72.7,
      functions: 81,
      lines: 87
    }
  }
}
