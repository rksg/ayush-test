const { createProxyMiddleware } = require('http-proxy-middleware')

/**
 * You could configure proxy to services for local development,
 * config below only works when you run this proxy in development mode with `npm start`
 *
 * It will not work when you build and deploy
 */
const CLOUD_URL = 'https://devalto.ruckuswireless.com'
module.exports = function setupProxy (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: CLOUD_URL,
      changeOrigin: true
    })
  )
  app.use(
    createProxyMiddleware('/api/websocket/socket.io', {
      target: CLOUD_URL,
      ws: true,
      changeOrigin: true
    })
  )
  return app
}
