module.exports = {
  displayName: 'rc-config-template-rec-components',
  preset: '../../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../../coverage/libs/rc/configTemplate/rec/components',
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 81,
      functions: 89,
      lines: 82
    }
  }
}
