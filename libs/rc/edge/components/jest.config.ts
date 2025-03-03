module.exports = {
  displayName: 'edge-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'edge-components.xml' }]
  ],
  coverageDirectory: '../../../../coverage/libs/rc/edge/components',
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 79,
      functions: 92,
      lines: 95
    }
  }
}
