const withModuleFederation = require('@nrwl/react/module-federation')
const { merge } = require('webpack-merge')

const modifyVars = require('./libs/common/components/src/theme/modify-vars')

/**
 * @param {Parameters<typeof withModuleFederation>[0]} moduleFederationConfig
 */
 module.exports = async function webpackConfigWithModuleFederation (
  moduleFederationConfig,
  additionalWebpackConfig = {}
) {
  const doModuleFederation = await withModuleFederation({
    ...moduleFederationConfig,
  })
  return function (config) {
    config = merge(doModuleFederation(config), {
      ...additionalWebpackConfig
    })

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
