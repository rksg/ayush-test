import React from 'react'

import { PageNoPermissions, PageNotFound }            from '@acx-ui/components'
import { useStreamActivityMessagesQuery }             from '@acx-ui/rc/services'
import { Route, TenantNavigate, rootRoutes }          from '@acx-ui/react-router-dom'
import { RolesEnum }                                  from '@acx-ui/types'
import { AuthRoute, hasRoles, useUserProfileContext } from '@acx-ui/user'
import { AccountTier }                                from '@acx-ui/utils'

import Administration                                                            from './pages/Administration'
import MigrationForm                                                             from './pages/Administration/OnpremMigration/MigrationForm/MigrationForm'
import MigrationSummary                                                          from './pages/Administration/OnpremMigration/MigrationTable/summary'
import { AddNewCustomRole }                                                      from './pages/Administration/UserPrivileges/CustomRoles/AddNewCustomRole'
import { AddPrivilegeGroup }                                                     from './pages/Administration/UserPrivileges/PrivilegeGroups/AddPrivilegeGroup'
import { EditPrivilegeGroup }                                                    from './pages/Administration/UserPrivileges/PrivilegeGroups/EditPrivilegeGroup'
import AICanvasQ1                                                                from './pages/AICanvas/archived/AICanvasQ1'
import AnalyticsBase                                                             from './pages/Analytics'
import Dashboard                                                                 from './pages/Dashboard'
import DevicesBase                                                               from './pages/Devices'
import Layout                                                                    from './pages/Layout'
import { MFACheck }                                                              from './pages/Layout/MFACheck'
import NetworksBase                                                              from './pages/Networks'
import PoliciesBase                                                              from './pages/Policies'
import ReportsBase                                                               from './pages/Reports'
import { RWGDetails }                                                            from './pages/RWG/RWGDetails'
import { RWGForm }                                                               from './pages/RWG/RWGForm'
import { RWGTable }                                                              from './pages/RWG/RWGTable'
import SearchResults                                                             from './pages/SearchResults'
import ServicesBase                                                              from './pages/Services'
import TimelineBase                                                              from './pages/Timeline'
import { UserProfile }                                                           from './pages/UserProfile'
import UsersBase                                                                 from './pages/Users'
import { VenueDetails, VenuesForm, VenueEdit, VenuesTable, PropertyUnitDetails } from './pages/Venues'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
const MspRoutes = React.lazy(() => import('@msp/Routes'))
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
const RcRoutes = React.lazy(() => import('@rc/Routes'))
const ReportsRoutes = React.lazy(() => import('@reports/Routes'))
const AnalyticsRoutes = React.lazy(() => import('./routes/AnalyticsRoutes'))

function AllRoutes () {
  const { data: userProfile } = useUserProfileContext()
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isSupportUser = Boolean(userProfile?.support)

  const getSpecialRoleRoute = () => {
    if (isGuestManager) {
      return <Route index element={<TenantNavigate replace to='/users/guestsManager' />} />
    } else if (isDPSKAdmin) {
      return <Route index element={<TenantNavigate replace to='/users/dpskAdmin' />} />
    } else {
      return <Route index element={<TenantNavigate replace to='/dashboard' />} />
    }
  }
  useStreamActivityMessagesQuery({})
  return rootRoutes(
    <>
      <Route path=':tenantId/t' element={<MFACheck />}>
        <Route path='*' element={<Layout />}>
          { getSpecialRoleRoute() }
          <Route path='*' element={<PageNotFound />} />
          <Route path='not-found' element={<PageNotFound />} />
          <Route path='no-permissions' element={<PageNoPermissions />} />
          <Route path='canvas' element={<AICanvasQ1 />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='userprofile/*' element={<UserProfileRoutes />} />
          <Route path='analytics/*'
            element={
              <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
                <AnalyticsBase />
              </AuthRoute>}>
            <Route path='*'
              element={<AnalyticsRoutes />} />
          </Route>
          <Route path='timeline/*' element={<TimelineBase />}>
            <Route path='*' element={<RcRoutes />} />
          </Route>
          <Route path='reports/*' element={<ReportsBase />}>
            <Route path='*' element={<ReportsRoutes />} />
          </Route>
          <Route path='dataStudio/*'
            element={
              <AuthRoute unsupportedTiers={isSupportUser ? []: [AccountTier.CORE]}>
                <ReportsBase />
              </AuthRoute>}>
            <Route path='*' element={<ReportsRoutes />} />
          </Route>
          <Route path='dataConnector/*' element={<ReportsBase />}>
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
      <Route
        path='add'
        element={
          <AuthRoute requireCrossVenuesPermission={{ needGlobalPermission: true }}>
            <VenuesForm />
          </AuthRoute>
        }
      />
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
      <Route path=':venueId/edit' element={<VenueEdit />} />
      <Route path=':venueId/edit/:activeTab/:activeSubTab' element={<VenueEdit />} />
      <Route path=':venueId/edit/:activeTab/:activeSubTab/:wifiRadioTab' element={<VenueEdit />} />
      <Route path=':venueId/:unitId/property-units' element={<PropertyUnitDetails />} />
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
      <Route path='userPrivileges/privilegeGroups/create' element={<AddPrivilegeGroup />} />
      <Route
        path='userPrivileges/privilegeGroups/:action/:groupId'
        element={<EditPrivilegeGroup />} />
      <Route path='userPrivileges/customRoles/create' element={<AddNewCustomRole />} />
      <Route path='userPrivileges/customRoles/:action/:customRoleId'
        element={<AddNewCustomRole />} />
      <Route path='onpremMigration/add'
        element={
          <AuthRoute requireCrossVenuesPermission={{ needGlobalPermission: true }}>
            <MigrationForm />
          </AuthRoute>} />
      <Route path='onpremMigration/:taskId/summary' element={<MigrationSummary />} />
    </Route>
  )
}

function RWGRoutes () {
  return rootRoutes(
    <Route path='/:tenantId/t/ruckus-wan-gateway'>
      <Route index element={<RWGTable />} />
      <Route path='*' element={<PageNotFound />} />
      <Route path='add' element={<RWGForm />} />
      <Route path=':venueId/:gatewayId/:action' element={<RWGForm />} />
      <Route path=':venueId/:gatewayId/gateway-details/:activeTab' element={<RWGDetails />} />
      <Route path=':venueId/:gatewayId/gateway-details/:activeTab/:clusterNodeId'
        element={<RWGDetails />} />
    </Route>
  )
}

function UserProfileRoutes () {
  return rootRoutes(
    <Route path=':tenantId/t/userprofile'>
      <Route
        index
        element={<TenantNavigate replace to='/userprofile/settings' />}
      />
      <Route path='*' element={<PageNotFound />} />
      <Route path=':activeTab' element={<UserProfile />} />
    </Route>
  )
}

export default AllRoutes
