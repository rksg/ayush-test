import React from 'react'

import {
  AccountManagement,
  AccountManagementTabEnum,
  RecommendationDetails,
  NetworkAssurance,
  NetworkAssuranceTabEnum,
  CrrmDetails,
  UnknownDetails,
  VideoCallQoe,
  VideoCallQoeForm,
  VideoCallQoeDetails,
  ServiceGuardForm,
  ServiceGuardSpecGuard,
  ServiceGuardTestGuard,
  ServiceGuardDetails,
  Profile
} from '@acx-ui/analytics/components'
import { updateSelectedTenant, getUserProfile }                          from '@acx-ui/analytics/utils'
import { useSearchParams, Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'
import { hasPermission }                                                 from '@acx-ui/user'

import ClientDetails                         from './pages/ClientDetails'
import Clients, { AIClientsTabEnum }         from './pages/Clients'
import ConfigChange                          from './pages/ConfigChange'
import IncidentDetails                       from './pages/IncidentDetails'
import Incidents                             from './pages/Incidents'
import Layout                                from './pages/Layout'
import Recommendations                       from './pages/Recommendations'
import SearchResults                         from './pages/SearchResults'
import { WiFiPage, WifiTabsEnum }            from './pages/Wifi'
import ApDetails                             from './pages/Wifi/ApDetails'
import { WiFiNetworksPage, NetworkTabsEnum } from './pages/WifiNetworks'
import NetworkDetails                        from './pages/WifiNetworks/NetworkDetails'
import Wired, { AISwitchTabsEnum }           from './pages/Wired'
import SwitchDetails                         from './pages/Wired/SwitchDetails'
import ZoneDetails                           from './pages/ZoneDetails'
import Zones                                 from './pages/Zones'

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const ReportsRoutes = React.lazy(() => import('@reports/Routes'))

const getDefaultRoute = () => {
  switch (true) {
    case hasPermission({ permission: 'READ_DASHBOARD' }):   return 'dashboard'
    case hasPermission({ permission: 'READ_HEALTH' }):      return 'health'
    case hasPermission({ permission: 'READ_REPORTS' }):     return 'reports'
    case hasPermission({ permission: 'READ_DATA_STUDIO' }): return 'dataStudio'
  }
  return 'profile/settings'
}
function Init () {
  const [ search ] = useSearchParams()
  updateSelectedTenant()
  const previousURL = search.get('return')!
  if (previousURL) {
    return <Navigate replace to={decodeURIComponent(previousURL)} />
  } else {
    const { selectedTenant } = getUserProfile()
    const selectedTenants = search.get('selectedTenants') ||
      window.btoa(JSON.stringify([selectedTenant.id]))
    return <Navigate
      replace
      to={{
        search: `?selectedTenants=${selectedTenants}`,
        pathname: `${MLISA_BASE_PATH}/${getDefaultRoute()}`
      }}
    />
  }
}

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Init />} />
    <Route path={MLISA_BASE_PATH} element={<Init />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='profile'>
        <Route path=':activeTab' element={<Profile />} />
      </Route>
      <Route path='recommendations'>
        <Route path=':activeTab' element={<Recommendations/>} />
        <Route path='aiOps/:id' element={<RecommendationDetails />} />
        <Route path='crrm/:id' element={<CrrmDetails />} />
        <Route path='crrm/unknown/*' element={<UnknownDetails />} />
      </Route>
      <Route path='incidents'>
        <Route index={true} element={<Incidents />} />
        <Route index={false} path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='networks/wireless'>
        <Route index={true} element={<WiFiNetworksPage tab={NetworkTabsEnum.LIST} />} />
        <Route
          path='reports/wlans'
          element={<WiFiNetworksPage tab={NetworkTabsEnum.WLANS_REPORT} />} />
        <Route
          path='reports/applications'
          element={<WiFiNetworksPage tab={NetworkTabsEnum.APPLICATIONS_REPORT} />} />
        <Route
          path='reports/wireless'
          element={<WiFiNetworksPage tab={NetworkTabsEnum.WIRELESS_REPORT} />} />
        <Route path=':networkId/network-details'>
          <Route path=':activeTab' element={<NetworkDetails />} />
        </Route>
      </Route>
      <Route path='devices/wifi'>
        <Route index={true}
          element={<WiFiPage tab={WifiTabsEnum.LIST} />} />
        <Route
          path='reports/aps'
          element={<WiFiPage tab={WifiTabsEnum.AP_REPORT} />} />
        <Route
          path='reports/airtime'
          element={<WiFiPage tab={WifiTabsEnum.AIRTIME_REPORT} />} />
        <Route
          path=':apId/details/:activeTab'
          element={<ApDetails />} />
        <Route
          path=':apId/details/:activeTab/:activeSubTab'
          element={<ApDetails />} />
        <Route
          path=':apId/details/:activeTab/:activeSubTab/:categoryTab'
          element={<ApDetails />} />
      </Route>
      <Route path='configChange' element={<ConfigChange />} />
      <Route path='reports/*' element={<ReportsRoutes />} />
      <Route path='dataStudio/*' element={<ReportsRoutes />} />
      <Route path='serviceValidation/*'>
        <Route index
          element={<NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD} />} />
        <Route path='add' element={<ServiceGuardForm />} />
        <Route path=':specId'>
          <Route
            path='edit'
            element={<ServiceGuardSpecGuard children={<ServiceGuardForm />} />}
          />
          <Route path='tests/:testId'>
            <Route
              index
              element={<ServiceGuardTestGuard children={<ServiceGuardDetails />} />}
            />
            <Route
              path='tab/:activeTab'
              element={<ServiceGuardTestGuard children={<ServiceGuardDetails />} />}
            />
          </Route>
        </Route>
      </Route>
      <Route path='videoCallQoe' >
        <Route index element={<VideoCallQoe />} />
        <Route path=':testId' element={<VideoCallQoeDetails/>} />
        <Route path='add' element={<VideoCallQoeForm />} />
      </Route>
      <Route path='occupancy' element={<div>Occupancy</div>} />
      <Route path='search/:searchVal' element={<SearchResults />} />
      <Route path='admin'>
        <Route path='onboarded'
          element={<AccountManagement tab={AccountManagementTabEnum.ONBOARDED_SYSTEMS}/>} />
        <Route path='users'
          element={<AccountManagement tab={AccountManagementTabEnum.USERS}/>} />
        <Route path='support'
          element={<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>} />
        <Route path='webhooks'
          element={<AccountManagement tab={AccountManagementTabEnum.WEBHOOKS}/>} />
      </Route>
      <Route path='health'>
        <Route index={true} element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />} />
        <Route path=':activeSubTab'
          element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />}>
          <Route path='tab/:categoryTab'
            element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />} />
        </Route>
        <Route index={false}
          path='tab/:categoryTab'
          element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />} />
      </Route>
      <Route path='devices/switch'>
        <Route path='' element={<Wired tab={AISwitchTabsEnum.SWITCH_LIST}/>} />
        <Route path='reports/wired'
          element={<Wired tab={AISwitchTabsEnum.WIRED_REPORT}/>} />
        <Route path=':switchId/serial/details/:activeTab' element={<SwitchDetails/>} />
      </Route>
      <Route path='users'>
        <Route path='wifi/clients' element={<Clients tab={AIClientsTabEnum.CLIENTS}/>} />
        <Route path='wifi/reports' element={<Clients tab={AIClientsTabEnum.REPORTS}/>} />
        <Route path='wifi/clients/:clientId'>
          <Route path=':activeTab'>
            <Route path=':activeTab' element={<ClientDetails />} />
            <Route path=':activeTab/:activeSubTab' element={<ClientDetails />} />
          </Route>
        </Route>
      </Route>
      <Route path='zones'>
        <Route index element={<Zones />} />
        <Route path=':systemName/:zoneName/:activeTab' element={<ZoneDetails />} />
        <Route path=':systemName/:zoneName/:activeTab/:activeSubTab' element={<ZoneDetails />} />
        <Route
          path=':systemName/:zoneName/:activeTab/:activeSubTab/:categoryTab'
          element={<ZoneDetails />} />
      </Route>
    </Route>
  </Route>)
}

export default AllRoutes
