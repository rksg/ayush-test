module.exports = {
  displayName: 'wifi-components',
  preset: '../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
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
