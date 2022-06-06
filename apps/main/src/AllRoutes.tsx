import React from 'react'

import { Route, TenantNavigate, rootRoutes } from '@acx-ui/react-router-dom'

import App              from './App'
import monitoringRoutes from './App/Monitoring/routes'
import NetworksBase     from './App/Networks'

const WiFiRoutes = React.lazy(() => import('rc-wifi/Routes'))

function AllRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId' element={<App />}>
      <Route index element={<TenantNavigate replace to='/monitoring' />} />
      {monitoringRoutes()}
      <Route path='networks/*' element={<NetworksBase />}>
        <Route path='*' element={<WiFiRoutes />} />
      </Route>
    </Route>
  )
}

export default AllRoutes
