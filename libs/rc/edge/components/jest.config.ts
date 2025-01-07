module.exports = {
  displayName: 'edge-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/rc/edge/components',
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 80,
      functions: 93,
      lines: 95
    }
  }
}
