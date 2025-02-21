module.exports = {
  displayName: 'main-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'main-components.xml' }]
  ],
  coverageDirectory: '../../../coverage/libs/main/components',
  coverageThreshold: {
    global: {
      statements: 76,
      branches: 60,
      functions: 75.2,
      lines: 76.5
    }
  }
}
