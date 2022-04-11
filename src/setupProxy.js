const { createProxyMiddleware } = require('http-proxy-middleware')

/**
 * You could configure proxy to services for local development,
 * config below only works when you run this proxy in development mode with `npm start`
 *
 * It will not work when you build and deploy
 */
module.exports = function setupProxy (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://devalto.ruckuswireless.com',
      changeOrigin: true
    })
  )
  return app
}
