const withModuleFederation = require('@nrwl/react/module-federation')
const { merge } = require('webpack-merge')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const modifyVars = require('./libs/common/components/src/theme/modify-vars')
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**
 * @param {Parameters<typeof withModuleFederation>[0]} moduleFederationConfig
 */
 module.exports = async function webpackConfigWithModuleFederation (
  moduleFederationConfig,
  additionalWebpackConfig = {   
    cache: true,
    experiments: {
      topLevelAwait: true,
      // Enable fast-refresh
    },
    watchOptions: {
      // Ignore specific directories or files
      ignored: /node_modules/,
      // Check for changes every 300ms
      aggregateTimeout: 150,
      
      // Enable polling for file changes
      poll: 500,
    },
    plugins: [
      new ReactRefreshWebpackPlugin(),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/node_modules\$/,
        contextRegExp: /react-loadable/,
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: './tsconfig.json',
        },
      })
    ],
  }
) {
  const doModuleFederation = await withModuleFederation({
    ...moduleFederationConfig,
  })
  return function (config) {
    config = merge(doModuleFederation(config), {
      ...additionalWebpackConfig
    })

    if (process.env.NODE_ENV === 'production') {
      config.devtool = 'hidden-source-map'
      config.mode = 'production'
      config.optimization.minimize = true
    }

    config.module.rules = config.module.rules.map(rule => {
      // remove handling of less from existing rules
      if (!rule.test.toString().includes('.less')) return rule
      rule.test = /\.css$|\.scss$|\.sass$|\.styl$/
      return rule
    })

    config.module.rules.push({
      test: /\.less$/,
      use: 'thread-loader',
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
