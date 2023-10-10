import '@acx-ui/theme'
import { get } from '@acx-ui/config'

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

  const isMaintenanceModeOn = get('ENABLED_FEATURES')?.split('|')
    .includes('maintenance_mode')

  if (window.location.pathname === '/analytics/maintenance.html') {
    return
  }
  if (isMaintenanceModeOn) {
    window.location.href = '/analytics/maintenance.html'
    return
  }

  const container = document.getElementById('root')
  const root = createRoot(container!)

  root.render(React.createElement(SuspenseBoundary.DefaultFallback, { absoluteCenter: true }))

  await config.initialize()

  const bootstrap = await import('./bootstrap')
  await bootstrap.init(root)
}

/* istanbul ignore next */
initialize()
