const webpackConfigWithModuleFederation = require('../../webpack.config.base')

const moduleFederationConfig = require('./module-federation.config')
const setupProxy = require('./src/setupProxy')

module.exports = webpackConfigWithModuleFederation({
  ...moduleFederationConfig,
  /*
   * Remote overrides for production.
   * Each entry is a pair of an unique name and the URL where it is deployed.
   *
   * e.g.
   * remotes: [
   *   ['app1', '//app1.example.com'],
   *   ['app2', '//app2.example.com'],
   * ]
   *
   * You can also use a full path to the remoteEntry.js file if desired.
   *
   * remotes: [
   *   ['app1', '//example.com/path/to/app1/remoteEntry.js'],
   *   ['app2', '//example.com/path/to/app2/remoteEntry.js'],
   * ]
   */
  remotes: [['rc-wifi-1', '//localhost:3001/']]
}, {
  devServer: {
    setupMiddlewares (md, server) {
      setupProxy(server.app)
      return md
    }
  }
})
