const withModuleFederation = require('@nrwl/react/module-federation')
const { merge } = require('webpack-merge')
const modifyVars = require('./libs/common/components/src/theme/modify-vars')
const path = require('path')
const fs = require('fs')

// Function to read dependencies from package.json
function getDependenciesFromPackageJson() {
  const packageJsonPath = path.resolve(__dirname, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const allDependencies = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    '@acx-ui/components',
    '@acx-ui/config',
    '@acx-ui/feature-toggle',
    '@acx-ui/formatter',
    '@acx-ui/icons',
    '@acx-ui/react-router-dom',
    '@acx-ui/store',
    '@acx-ui/theme',
    '@acx-ui/types',
    '@acx-ui/user',
    '@acx-ui/utils'
  ])

  return allDependencies
}

// Get core libraries from package.json
const coreLibraries = getDependenciesFromPackageJson()

/**
 * @param {Parameters<typeof withModuleFederation>[0]} moduleFederationConfig
 */
 module.exports = async function webpackConfigWithModuleFederation (
  moduleFederationConfig,
  additionalWebpackConfig = {}
) {
  const extendedModuleFederationConfig = {
    ...moduleFederationConfig,
    shared: (libraryName, defaultConfig) => {
      if (coreLibraries.has(libraryName)) {
        return {
          ...defaultConfig,
          singleton: true,
          requiredVersion: defaultConfig.requiredVersion,
        }
      }
      // You can add additional logic here for non-core libraries if needed
      return false
    }
  }

  const doModuleFederation = await withModuleFederation(process.env.NODE_ENV === 'production' ?
  moduleFederationConfig : extendedModuleFederationConfig)
  return function (config) {
    config = merge(doModuleFederation(config), additionalWebpackConfig)
    if (process.env.NODE_ENV === 'production') {
      config.devtool = 'hidden-source-map'
      config.mode = 'production'
      config.optimization.minimize = true
    } else {
      // config.cache = true
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        buildDependencies: {
          config: [__filename],
        },
      }
      config.watchOptions = {
        ignored: /node_modules/
      }
    }

    config.module.rules = config.module.rules.map(rule => {
      // remove handling of less from existing rules
      if (!rule.test.toString().includes('.less')) return rule
      rule.test = /\.css$|\.scss$|\.sass$|\.styl$/
      return rule
    })

    config.module.rules.push({
      test: /\.less$/,
      use: ['style-loader', 'css-loader', {
        loader: 'less-loader',
        options: {
          lessOptions: {
            modifyVars,
            javascriptEnabled: true,
          }
        }
      }]
    })

    return config
  }
}
