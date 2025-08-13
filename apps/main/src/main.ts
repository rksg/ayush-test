import '@acx-ui/theme'

async function initialize () {
  const [
    React,
    { createRoot },
    { SuspenseBoundary },
    config,
    utils
  ] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('@acx-ui/components'),
    import('@acx-ui/config'),
    import('@acx-ui/utils')
  ])

  const container = document.getElementById('root')
  const root = createRoot(container!)

  root.render(React.createElement(SuspenseBoundary.DefaultFallback, { absoluteCenter: true }))

  try {
    await config.initialize()
  } catch (error) {
    if (error instanceof config.CommonConfigGetError) {
      utils.userLogout()
    } else {
      throw error
    }
  }

  const bootstrap = await import('./bootstrap')
  await bootstrap.init(root)
}

initialize()
