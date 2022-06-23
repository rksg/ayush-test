const https = require('https')

const { createProxyMiddleware } = require('http-proxy-middleware')

/**
 * Configure proxy to devalto for local development
 * See https://create-react-app.dev/docs/proxying-api-requests-in-development/
 */
const CLOUD_URL = 'https://devalto.ruckuswireless.com'
const LOCAL_MLISA_URL = 'https://alto.local.mlisa.io'
module.exports = async function setupProxy (app) {
  const localDataApi = new Promise((resolve) => {
    https
      .get(LOCAL_MLISA_URL, () => { resolve('up') })
      .on('error', () => { resolve('down') })
  })
  if (await localDataApi === 'up') {
    app.use(createProxyMiddleware(
      '/api/a4rc',
      {
        target: LOCAL_MLISA_URL,
        changeOrigin: true,
        onProxyReq: (proxyReq) => {
          proxyReq.setHeader('x-mlisa-tenant-id', 'a27e3eb0bd164e01ae731da8d976d3b1')
          proxyReq.setHeader('x-mlisa-user-role', 'alto-report-only')
          proxyReq.setHeader('x-mlisa-user-id', 'some-id')
        }
      }
    ))
  }
  app.use(createProxyMiddleware(
    '/api/websocket/socket.io',
    { target: CLOUD_URL, changeOrigin: true, ws: true }
  ))
  app.use(createProxyMiddleware(
    '/api',
    { target: CLOUD_URL, changeOrigin: true }
  ))
  return app
}
