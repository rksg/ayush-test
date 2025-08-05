module.exports = {
  displayName: 'rc-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'rc-components.xml' }]
  ],
  coverageDirectory: '../../../../coverage/libs/rc/shared/components',
  coverageThreshold: {
    global: {
      statements: 81,
      branches: 70,
      functions: 80,
      lines: 82
    }
  }
}
