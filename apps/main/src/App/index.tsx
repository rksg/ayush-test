import React from 'react'

import { Outlet }        from '@acx-ui/react-router-dom'
import { SplitProvider } from '@acx-ui/utils'

import Layout from '../App/Layout'

function App () {
  return <SplitProvider>
    <Layout content={<Outlet />} />
  </SplitProvider>
}

export default App
