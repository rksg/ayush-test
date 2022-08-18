import React from 'react'

import { Route, TenantNavigate, rootRoutes } from '@acx-ui/react-router-dom'

import App              from './App'
import AnalyticsBase    from './App/Analytics'
import Dashboard        from './App/Dashboard'
import NetworksBase     from './App/Networks'
import { VenueDetails } from './App/Venues/VenueDetails'
import { VenuesTable }  from './App/Venues/VenuesTable'

const WifiRoutes = React.lazy(() => import('rc/Routes'))
const AnalyticsRoutes = React.lazy(() => import('analytics/Routes'))

function AllRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId' element={<App />}>
      <Route index element={<TenantNavigate replace to='/dashboard' />} />
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='analytics/*' element={<AnalyticsBase />}>
        <Route path='*' element={<AnalyticsRoutes />} />
      </Route>
      <Route path='networks/*' element={<NetworksBase />}>
        <Route path='*' element={<WifiRoutes />} />
      </Route>
      <Route path='venues/*'>
        <Route path='*' element={<VenuesTable />} />
        <Route path=':venueId/venue-details/:activeTab' element={<VenueDetails />} />
      </Route>
    </Route>
  )
}

export default AllRoutes
