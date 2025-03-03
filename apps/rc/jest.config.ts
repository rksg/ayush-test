module.exports = {
  displayName: 'rc',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'rc.xml' }]
  ],
  coverageDirectory: '../../coverage/apps/rc',
  coverageThreshold: {
    global: {
      statements: 84.5,
      branches: 72,
      functions: 82.5,
      lines: 85
    }
  }
}
