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
      statements: 87.5,
      branches: 71.5,
      functions: 78.5,
      lines: 88.0
    }
  }
}
