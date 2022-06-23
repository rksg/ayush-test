import React from 'react'

import { SplitProvider } from '@acx-ui/feature-toggle'
import { Outlet }        from '@acx-ui/react-router-dom'

import Layout from '../App/Layout'

function App () {
  return <SplitProvider>
    <Layout content={<Outlet />} />
  </SplitProvider>
}

export default App
