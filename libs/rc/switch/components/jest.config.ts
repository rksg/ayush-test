module.exports = {
  displayName: 'switch-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'switch-components.xml' }]
  ],
  coverageDirectory: '../../../../coverage/libs/rc/switch/components',
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 78,
      functions: 89,
      lines: 90
    }
  }
}
