//const http = require('http')
const https = require('https')

const { createProxyMiddleware } = require('http-proxy-middleware')
/* <== change this as "//*" and restart dev server to turn on the mock server
const jsonServerCli = require('json-server/lib/cli/run')

jsonServerCli({
  host: 'localhost',
  port: 5000,
  snapshots: '.',
  watch: true,
  _: [require('path').join(__dirname, 'json-server.json')]
})
//*/


/**
 * Configure proxy to devalto for local development
 * See https://create-react-app.dev/docs/proxying-api-requests-in-development/
 */
//const MOCK_SERVER_URL = 'http://localhost:5000'
const CLOUD_URL = 'https://dev.ruckus.cloud'
const LOCAL_MLISA_URL = 'https://alto.local.mlisa.io'
const STATIC_ASSETS = 'https://storage.googleapis.com/ruckus-web-1'

module.exports = async function setupProxy (app) {
/*
  const mockServerApi = new Promise((resolve) => {
    http
      .get(MOCK_SERVER_URL, () => { resolve('up') })
      .on('error', () => { resolve('down') })
  })
  if (await mockServerApi === 'up') {
    app.use(createProxyMiddleware(
      '/venues/apCompatibilities/query',
      {
        target: MOCK_SERVER_URL,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '.+': '/venues-apCompatibilities-query'
        },
        onProxyReq: function (request) {
          request.setHeader('origin', CLOUD_URL)
          request.method = 'GET'
        }
      }
    ))
    app.use(createProxyMiddleware(
      '/venues/aps/apCompatibilities/query',
      {
        target: MOCK_SERVER_URL,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '.+': '/venues-aps-apCompatibilities-query'
        },
        onProxyReq: function (request) {
          request.setHeader('origin', CLOUD_URL)
          request.method = 'GET'
        }
      }
    ))
  }
  */

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
        onProxyReq: (proxyReq, { headers, socket }) => {
          proxyReq.setHeader('x-mlisa-tenant-id',
            headers['x-mlisa-tenant-id'] || headers.referer.match(/([0-9a-f]{32})\/[t|v]/)[1])
          proxyReq.setHeader('x-mlisa-user-role',
            headers['x-mlisa-user-role'] || 'alto-report-only')
          proxyReq.setHeader('x-mlisa-user-id', headers['x-mlisa-user-id'] || 'some-id')
          socket.on('close', () => proxyReq.socket.destroy())
        }
      }
    ))
  }

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
  app.use(createProxyMiddleware(
    '/api/websocket/socket.io',
    {
      target: CLOUD_URL, changeOrigin: true, ws: true,
      onProxyReqWs: function (request) {
        request.setHeader('origin', CLOUD_URL)
      }
    }
  ))
  app.use(createProxyMiddleware(
    '/api',
    { target: CLOUD_URL, changeOrigin: true,
      onProxyReq: function (request) {
        request.setHeader('origin', CLOUD_URL)
      }
    }
  ))
  app.use(createProxyMiddleware(
    '/g/',
    { target: CLOUD_URL, changeOrigin: true,
      onProxyReq: function (request) {
        request.setHeader('origin', CLOUD_URL)
      }
    }
  ))
  app.use(createProxyMiddleware(
    '/mfa',
    { target: CLOUD_URL, changeOrigin: true,
      onProxyReq: function (request) {
        request.setHeader('origin', CLOUD_URL)
      }
    }
  ))
  app.use(createProxyMiddleware(
    '/allowedOperations',
    { target: CLOUD_URL, changeOrigin: true,
      onProxyReq: function (request) {
        request.setHeader('origin', CLOUD_URL)
      }
    }
  ))
  app.use(createProxyMiddleware(
    '/**',
    {
      target: CLOUD_URL.replace('//', '//api.'),
      changeOrigin: true,
      secure: false,
      onProxyReq: function (request) {
        request.setHeader('origin', CLOUD_URL)
      }
    }
  ))
  return app
}
