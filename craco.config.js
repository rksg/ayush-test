const CracoLessPlugin = require('craco-less')
const modifyVars = require('./src/theme/modify-vars')

module.exports = {
  plugins: [{
    plugin: CracoLessPlugin,
    options: {
      lessLoaderOptions: {
        lessOptions: {
          modifyVars,
          javascriptEnabled: true
        }
      }
    }
  }]
}
