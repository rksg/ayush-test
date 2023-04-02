import '@acx-ui/theme'

async function initialize () {
  const [
    React,
    { Spin },
    { createRoot },
    config
  ] = await Promise.all([
    import('react'),
    import('antd'),
    import('react-dom/client'),
    import('@acx-ui/config')
  ])

  const container = document.getElementById('root')
  const root = createRoot(container!)

  root.render(React.createElement(Spin, {
    size: 'large',
    style: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }))

  await config.initialize()

  const bootstrap = await import('./bootstrap')
  await bootstrap.init(root)
}

initialize()
