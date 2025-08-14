module.exports = {
  displayName: 'msp-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'msp-components.xml' }]
  ],
  coverageDirectory: '../../../../coverage/libs/rc/msp/components',
  coverageThreshold: {
    global: {
      statements: 87.8,
      branches: 72.4,
      functions: 78.8,
      lines: 88.2
    }
  }
}
