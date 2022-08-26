import React from 'react'

import { Route, TenantNavigate, rootRoutes } from '@acx-ui/react-router-dom'

import App              from './App'
import AnalyticsBase    from './App/Analytics'
import Dashboard        from './App/Dashboard'
import NetworksBase     from './App/Networks'
import ServicesBase     from './App/Services'
import { VenueDetails } from './App/Venues/VenueDetails'
import { VenuesTable }  from './App/Venues/VenuesTable'
import { VenueEdit }   from './App/Venues/VenueEdit'

const RcRoutes = React.lazy(() => import('rc/Routes'))
const AnalyticsRoutes = React.lazy(() => import('analytics/Routes'))
const MspRoutes = React.lazy(() => import('msp/Routes'))

function AllRoutes () {
  return rootRoutes(
    <>
      <Route path='t/:tenantId' element={<App />}>
        <Route index element={<TenantNavigate replace to='/dashboard' />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='analytics/*' element={<AnalyticsBase />}>
          <Route path='*' element={<AnalyticsRoutes />} />
        </Route>
        <Route path='networks/*' element={<NetworksBase />}>
          <Route path='*' element={<RcRoutes />} />
        </Route>
        <Route path='services/*' element={<ServicesBase />}>
          <Route path='*' element={<RcRoutes />} />
        </Route>
        <Route path='venues'>
          <Route index element={<VenuesTable />} />
          <Route path=':venueId/venue-details/:activeTab' element={<VenueDetails />} />
          <Route path=':venueId/edit/:activeTab' element={<VenueEdit />} />
        </Route>
      </Route>
      <Route path='v/:tenantId/*' element={<MspRoutes />} />
    </>
  )
}

export default AllRoutes
