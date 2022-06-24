module.exports = {
  displayName: 'common-components',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/common/components',
  coverageThreshold: {
    global: {
      statements: 41.86,
      branches: 46.62,
      functions: 44.94,
      lines: 41.02
    }
  }
}
