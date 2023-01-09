const webpackConfigWithModuleFederation = require('../../webpack.config.base')

const moduleFederationConfig = require('./module-federation.config')

module.exports = webpackConfigWithModuleFederation(moduleFederationConfig)
