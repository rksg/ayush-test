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
      statements: 90,
      branches: 78,
      functions: 89,
      lines: 90
    }
  }
}
