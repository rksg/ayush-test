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
  await config.initialize('ra')

  const isMaintenanceModeOn = config.get('ENABLED_FEATURES')?.split('|')
    .includes('maintenance_mode')

  if (isMaintenanceModeOn) {
    window.location.href = '/analytics/maintenance.html'
    return
  }

  const container = document.getElementById('root')
  const root = createRoot(container!)

  root.render(React.createElement(SuspenseBoundary.DefaultFallback, { absoluteCenter: true }))

  const bootstrap = await import('./bootstrap')
  await bootstrap.init(root)
}

/* istanbul ignore next */
initialize()
