module.exports = {
  displayName: 'rc-config-template-msp-components',
  preset: '../../../../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../../coverage/libs/rc/configTemplate/msp/components',
  coverageThreshold: {
    global: {
      statements: 95.2,
      branches: 93.4,
      functions: 93.4,
      lines: 95
    }
  }
}
