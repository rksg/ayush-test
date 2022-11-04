import React from 'react'

import { Route, TenantNavigate, rootRoutes } from '@acx-ui/react-router-dom'

import AnalyticsBase    from './pages/Analytics'
import Dashboard        from './pages/Dashboard'
import DevicesBase      from './pages/Devices'
import Layout           from './pages/Layout'
import NetworksBase     from './pages/Networks'
import ServicesBase     from './pages/Services'
import { VenueDetails } from './pages/Venues/VenueDetails'
import { VenueEdit }    from './pages/Venues/VenueEdit'
import { VenuesForm }   from './pages/Venues/VenuesForm'
import { VenuesTable }  from './pages/Venues/VenuesTable'

const RcRoutes = React.lazy(() => import('rc/Routes'))
const AnalyticsRoutes = React.lazy(() => import('analytics/Routes'))
const MspRoutes = React.lazy(() => import('msp/Routes'))

function AllRoutes () {
  return rootRoutes(
    <>
      <Route path='t/:tenantId' element={<Layout />}>
        <Route index element={<TenantNavigate replace to='/dashboard' />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='analytics/*' element={<AnalyticsBase />}>
          <Route path='*' element={<AnalyticsRoutes />} />
        </Route>
        <Route path='devices/*' element={<DevicesBase />}>
          <Route path='*' element={<RcRoutes />} />
        </Route>
        <Route path='networks/*' element={<NetworksBase />}>
          <Route path='*' element={<RcRoutes />} />
        </Route>
        <Route path='services/*' element={<ServicesBase />}>
          <Route path='*' element={<RcRoutes />} />
        </Route>
        <Route path='venues/*' element={<VenuesRoutes />} />
      </Route>
      <Route path='v/:tenantId/*' element={<MspRoutes />} />
    </>
  )
}

function VenuesRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId/venues'>
      <Route index element={<VenuesTable />} />
      <Route path='add' element={<VenuesForm />} />
      <Route path=':venueId/venue-details/:activeTab' element={<VenueDetails />} />
      <Route path=':venueId/venue-details/:activeTab/:activeSubTab' element={<VenueDetails />} />
      <Route path=':venueId/:action/:activeTab' element={<VenueEdit />} />
      <Route path=':venueId/edit/:activeTab/:activeSubTab' element={<VenueEdit />} />
    </Route>
  )
}

export default AllRoutes
