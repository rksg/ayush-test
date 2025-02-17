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
      statements: 77,
      branches: 56,
      functions: 71,
      lines: 77
    }
  }
}
