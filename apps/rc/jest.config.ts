module.exports = {
  displayName: 'rc',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.mjs?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'rc.xml' }]
  ],
  coverageDirectory: '../../coverage/apps/rc',
  coverageThreshold: {
    global: {
      statements: 84.5,
      branches: 71,
      functions: 82,
      lines: 85
    }
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/test-setup.ts',
    '!src/**/index.ts',
    '!src/**/types.ts'
  ]
}
