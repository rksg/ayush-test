import '@acx-ui/theme'

/* istanbul ignore next */
export async function initialize () {
  const [
    React,
    { createRoot },
    { SuspenseBoundary },
    config
  ] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('@acx-ui/components'),
    import('@acx-ui/config')
  ])

  const container = document.getElementById('root')
  const root = createRoot(container!)

  root.render(React.createElement(SuspenseBoundary.DefaultFallback, { absoluteCenter: true }))

  await config.initialize()

  const bootstrap = await import('./bootstrap')
  await bootstrap.init(root)
}

/* istanbul ignore next */
initialize()
