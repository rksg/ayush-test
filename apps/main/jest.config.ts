module.exports = {
  displayName: 'main',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: [
    '/.*\\/archived\\/.*/'
  ],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'main.xml' }]
  ],
  coverageDirectory: '../../coverage/apps/main',
  coverageThreshold: {
    global: {
      statements: 86.4,
      branches: 73.10,
      functions: 82.5,
      lines: 87.1
    }
  }
}
