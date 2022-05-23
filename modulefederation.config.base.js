const { dependencies: deps } = require('./package.json')
const { compilerOptions: { paths } } = require('./tsconfig.base.json')

const npmPackages = Object.keys(deps).reduce((agg, key) => ({
  ...agg,
  [key]: { singleton: true, requiredVersion: deps[key] }
}), {})

const sharedLibraries = Object.keys(paths).reduce((acc, key) => ({
  ...acc,
  [key]: { singleton: true, requiredVersion: false }
}), {})

module.exports = {
  shared: {
    ...npmPackages,
    ...sharedLibraries
  }
}
