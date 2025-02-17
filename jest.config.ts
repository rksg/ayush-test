const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: getJestProjects(),
  reporters: [
    'default',
    [ "jest-junit", { "outputDirectory": ".", "outputName": "flaky-test-detector-results.xml" } ]
  ]
}