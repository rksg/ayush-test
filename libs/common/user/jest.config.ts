module.exports = {
  displayName: 'common-user',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/services.ts'
  ],
  coverageDirectory: '../../../coverage/libs/common/user',
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
}
