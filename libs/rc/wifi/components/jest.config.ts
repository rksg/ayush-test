module.exports = {
  displayName: 'wifi-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'wifi-components.xml' }]
  ],
  coverageDirectory: '../../../../coverage/libs/rc/wifi/components',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 68,
      functions: 76,
      lines: 81
    }
  }
}
