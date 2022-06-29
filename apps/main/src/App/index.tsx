import React from 'react'

import { SplitProvider } from '@acx-ui/feature-toggle'
import { Outlet }        from '@acx-ui/react-router-dom'

import '@acx-ui/i18next'
import Layout from '../App/Layout'

function App () {
  return <SplitProvider>
    <Layout content={<Outlet />} />
  </SplitProvider>
}

export default App
