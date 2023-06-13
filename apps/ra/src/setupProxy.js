const https = require('https')

const { createProxyMiddleware } = require('http-proxy-middleware')

/**
 * Configure proxy to devalto for local development
 * See https://create-react-app.dev/docs/proxying-api-requests-in-development/
 */
const CLOUD_URL = 'https://staging.mlisa.io'
const LOCAL_MLISA_URL = 'https://local.mlisa.io'
const STATIC_ASSETS = 'https://storage.googleapis.com/ruckus-web-1'
module.exports = async function setupProxy (app) {
  const localDataApi = new Promise((resolve) => {
    https
      .get(LOCAL_MLISA_URL, () => { resolve('up') })
      .on('error', () => { resolve('down') })
  })
  app.use(createProxyMiddleware('/analytics', {
    target: await localDataApi === 'up' ? LOCAL_MLISA_URL : CLOUD_URL,
    changeOrigin: true
  }))

  app.use(createProxyMiddleware(
    '/docs',
    {
      target: 'https://docs.cloud.ruckuswireless.com',
      changeOrigin: true,
      pathRewrite: { '^/docs': '/' }
    }
  ))
  app.use(createProxyMiddleware(
    '/locales/compiled/',
    {
      target: STATIC_ASSETS,
      changeOrigin: true,
      onProxyReqWs: function (request) {
        request.setHeader('origin', STATIC_ASSETS)
      }
    }
  ))

  return app
}
