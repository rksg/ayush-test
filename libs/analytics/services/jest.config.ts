module.exports = {
  displayName: 'analytics-services',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/analytics/services',
  setupFilesAfterEnv: ['./setupServer.ts']
}
