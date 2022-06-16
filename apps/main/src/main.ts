
async function initialize () {
  const config = await import('@acx-ui/config')
  await config.initialize()

  import('./bootstrap')
}

initialize()
