
async function initialize () {
  const config = await import('@acx-ui/config')
  await config.initialize()

  const bootstrap = await import('./bootstrap')
  await bootstrap.init()
}

initialize()
