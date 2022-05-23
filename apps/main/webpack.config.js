const webpackConfigWithModuleFederation = require('../../webpack.config.base')

const moduleFederationConfig = require('./module-federation.config')
const setupProxy = require('./src/setupProxy')

module.exports = webpackConfigWithModuleFederation(moduleFederationConfig, {
  devServer: {
    setupMiddlewares (md, server) {
      setupProxy(server.app)
      return md
    }
  }
})
