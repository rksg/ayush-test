import React from 'react'

import { PageNotFound }                      from '@acx-ui/components'
import { useStreamActivityMessagesQuery }    from '@acx-ui/rc/services'
import { Route, TenantNavigate, rootRoutes } from '@acx-ui/react-router-dom'

import Administration   from './pages/Administration'
import MigrationForm    from './pages/Administration/OnpremMigration/MigrationForm/MigrationForm'
import MigrationSummary from './pages/Administration/OnpremMigration/MigrationTable/summary'
import AnalyticsBase    from './pages/Analytics'
import Dashboard        from './pages/Dashboard'
import Dashboardv2      from './pages/Dashboardv2'
import DevicesBase      from './pages/Devices'
import Layout           from './pages/Layout'
import { MFACheck }     from './pages/Layout/MFACheck'
import NetworksBase     from './pages/Networks'
import PoliciesBase     from './pages/Policies'
import ReportsBase      from './pages/Reports'
import { RWGTable }     from './pages/RWG/RWGTable'
import SearchResults    from './pages/SearchResults'
import ServicesBase     from './pages/Services'
import TimelineBase     from './pages/Timeline'
import { UserProfile }  from './pages/UserProfile'
import UsersBase        from './pages/Users'
import { VenueDetails } from './pages/Venues/VenueDetails'
import { VenueEdit }    from './pages/Venues/VenueEdit'
import { VenuesForm }   from './pages/Venues/VenuesForm'
import { VenuesTable }  from './pages/Venues/VenuesTable'
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
const MspRoutes = React.lazy(() => import('@msp/Routes'))
const RcRoutes = React.lazy(() => import('@rc/Routes'))
const ReportsRoutes = React.lazy(() => import('@reports/Routes'))
/* eslint-enable @nrwl/nx/enforce-module-boundaries */
const AnalyticsRoutes = React.lazy(() => import('./routes/AnalyticsRoutes'))

function AllRoutes () {
  useStreamActivityMessagesQuery({})
  return rootRoutes(
    <>
      <Route path=':tenantId/t' element={<MFACheck />}>
        <Route path='*' element={<Layout />}>
          <Route index element={<TenantNavigate replace to='/dashboard' />} />
          <Route path='*' element={<PageNotFound />} />
          <Route path='dashboard' element={<Dashboardv2 />} />
          <Route path='dashboard-v1' element={<Dashboard />} />
          <Route path='userprofile' element={<UserProfile />} />
          <Route path='analytics/*' element={<AnalyticsBase />}>
            <Route path='*' element={<AnalyticsRoutes />} />
          </Route>
          <Route path='timeline/*' element={<TimelineBase />}>
            <Route path='*' element={<RcRoutes />} />
          </Route>
          <Route path='reports/*' element={<ReportsBase />}>
            <Route path='*' element={<ReportsRoutes />} />
          </Route>
          <Route path='dataStudio/*' element={<ReportsBase />}>
            <Route path='*' element={<ReportsRoutes />} />
          </Route>
          <Route path='devices/*' element={<DevicesBase />}>
            <Route path='*' element={<RcRoutes />} />
          </Route>
          <Route path='networks/*' element={<NetworksBase />}>
            <Route path='*' element={<RcRoutes />} />
          </Route>
          <Route path='search/:searchVal' element={<SearchResults />} />
          <Route path='services/*' element={<ServicesBase />}>
            <Route path='*' element={<RcRoutes />} />
          </Route>
          <Route path='policies/*' element={<PoliciesBase />}>
            <Route path='*' element={<RcRoutes />} />
          </Route>
          <Route path='users/*' element={<UsersBase />}>
            <Route path='*' element={<RcRoutes />} />
          </Route>
          <Route path='venues/*' element={<VenuesRoutes />} />
          <Route path='administration/*' element={<AdministrationRoutes />} />
          <Route path='ruckus-wan-gateway/*' element={<RWGRoutes />} />
        </Route>
      </Route>
      <Route path=':tenantId/v/*' element={<MFACheck />}>
        <Route path='*' element={<MspRoutes />}/>
      </Route>
      {/* redirect old urls to dashboard */}
      <Route
        path='/api/ui-beta/t/:tenantId/*'
        element={<TenantNavigate replace to='dashboard' />}
      />
      <Route
        path='/api/ui-beta/v/:tenantId/*'
        element={<TenantNavigate replace to='dashboard' tenantType='v' />}
      />
    </>
  )
}

function VenuesRoutes () {
  return rootRoutes(
    <Route path='/:tenantId/t/venues'>
      <Route index element={<VenuesTable />} />
      <Route path='*' element={<PageNotFound />} />
      <Route path='add' element={<VenuesForm />} />
      <Route path=':venueId/venue-details/:activeTab' element={<VenueDetails />} />
      <Route
        path=':venueId/venue-details/:activeTab/:activeSubTab'
        element={<VenueDetails />}
      />
      <Route
        path=':venueId/venue-details/:activeTab/:activeSubTab/:categoryTab'
        element={<VenueDetails />}
      />
      <Route path=':venueId/:action/:activeTab' element={<VenueEdit />} />
      <Route path=':venueId/edit/:activeTab/:activeSubTab' element={<VenueEdit />} />
    </Route>
  )
}

function AdministrationRoutes () {
  return rootRoutes(
    <Route path=':tenantId/t/administration'>
      <Route
        index
        element={<TenantNavigate replace to='/administration/accountSettings' />}
      />
      <Route path='*' element={<PageNotFound />} />
      <Route path=':activeTab' element={<Administration />} />
      <Route path=':activeTab/:activeSubTab' element={<Administration />} />
      <Route path='onpremMigration/add' element={<MigrationForm />} />
      <Route path='onpremMigration/:taskId/summary' element={<MigrationSummary />} />
    </Route>
  )
}

function RWGRoutes () {
  return rootRoutes(
    <Route path='/:tenantId/t/ruckus-wan-gateway'>
      <Route index element={<RWGTable />} />
      <Route path='*' element={<PageNotFound />} />
      {/* <Route path='add' element={<VenuesForm />} /> */}
      {/* <Route path=':venueId/:action/:activeTab' element={<VenueEdit />} /> */}
    </Route>
  )
}

export default AllRoutes
