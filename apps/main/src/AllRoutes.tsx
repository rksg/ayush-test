import React from 'react'

import { Routes, Route, TenantNavigate } from '@acx-ui/react-router-dom'

import App          from './App'
import Dashboard    from './App/Dashboard'
import NetworksBase from './App/Networks'

const WifiRoutes = React.lazy(() => import('rc-wifi/Routes'))

function AllRoutes () {
  return (
    <Routes>
      <Route path='/t/:tenantId' element={<App />}>
        <Route index element={<TenantNavigate replace to='/dashboard' />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='networks/*' element={<NetworksBase />}>
          <Route path='*' element={<WifiRoutes />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AllRoutes
