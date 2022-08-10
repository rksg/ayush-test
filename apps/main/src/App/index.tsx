import React from 'react'

import { SplitProvider }      from '@acx-ui/feature-toggle'
import { Outlet }             from '@acx-ui/react-router-dom'
import { DateFilterProvider } from '@acx-ui/utils'

import Layout from '../App/Layout'

function App () {
  return <SplitProvider>
    <DateFilterProvider>
      <Layout content={<Outlet />} />
    </DateFilterProvider>
  </SplitProvider>
}

export default App
