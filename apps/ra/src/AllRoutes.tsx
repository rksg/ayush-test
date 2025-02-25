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
  Profile,
  AIAnalytics,
  AIAnalyticsTabEnum,
  IntentAIForm,
  IntentAIDetails
} from '@acx-ui/analytics/components'
import { updateSelectedTenant, getUserProfile }                          from '@acx-ui/analytics/utils'
import { useSearchParams, Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'
import { hasRaiPermission, RaiPermission }                               from '@acx-ui/user'

import ClientDetails                         from './pages/ClientDetails'
import Clients, { AIClientsTabEnum }         from './pages/Clients'
import ConfigChange                          from './pages/ConfigChange'
import IncidentDetails                       from './pages/IncidentDetails'
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
    case hasRaiPermission('READ_DASHBOARD'):   return 'dashboard'
    case hasRaiPermission('READ_HEALTH'):      return 'health'
    case hasRaiPermission('READ_REPORTS'):     return 'reports'
    case hasRaiPermission('READ_DATA_STUDIO'): return 'dataStudio'
    case hasRaiPermission('READ_DATA_CONNECTOR'): return 'dataConnector'
  }
  return 'profile/settings'
}

const check = (permission: RaiPermission, component?: JSX.Element) =>
  !permission || hasRaiPermission(permission) ? component : <Init />

function Init () {
  const [ search ] = useSearchParams()
  updateSelectedTenant()
  const previousURL = search.get('return')!
  if (previousURL) {
    return <Navigate replace to={decodeURIComponent(previousURL)} />
  } else {
    const { selectedTenant: { id } } = getUserProfile()
    const selectedTenants = search.get('selectedTenants') || window.btoa(JSON.stringify([id]))
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
  const [ search ] = useSearchParams() // to refresh available routes when we change tenant
  return rootRoutes(<Route key={search.get('selectedTenants')} element={<Layout />}>
    <Route path='/' element={<Init />} />
    <Route path={MLISA_BASE_PATH} element={<Init />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='dashboard' element={check('READ_DASHBOARD', <Dashboard />)} />
      <Route path='profile'>
        <Route path=':activeTab' element={<Profile />} />
      </Route>
      <Route path='recommendations'>
        <Route path=':activeTab' element={<Recommendations/>} />
        <Route path='aiOps/:id' element={check('READ_AI_OPERATIONS', <RecommendationDetails/>)}/>
        <Route path='crrm/:id' element={check('READ_AI_DRIVEN_RRM', <CrrmDetails />)}/>
        <Route path='crrm/unknown/*' element={check('READ_AI_DRIVEN_RRM', <UnknownDetails />)}/>
      </Route>
      <Route path='incidents' element={check('READ_INCIDENTS')}>
        <Route index={true} element={<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS} />} />
        <Route path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='intentAI' element={check('READ_INTENT_AI')}>
        <Route index={true} element={<AIAnalytics tab={AIAnalyticsTabEnum.INTENTAI} />} />
        <Route path=':root/:sliceId/:code' element={<IntentAIDetails />} />
        <Route path=':root/:sliceId/:code/edit' element={<IntentAIForm />} />
      </Route>
      <Route path='networks/wireless' element={check('READ_WIFI_NETWORKS_LIST')}>
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
      <Route path='devices/wifi' element={check('READ_ACCESS_POINTS_LIST')}>
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
      <Route path='configChange' element={check('READ_CONFIG_CHANGE', <ConfigChange />)} />
      <Route path='reports/*' element={check('READ_REPORTS', <ReportsRoutes />)} />
      <Route path='dataStudio/*' element={check('READ_DATA_STUDIO', <ReportsRoutes />)} />
      <Route path='dataConnector/*'
        element={check('READ_DATA_CONNECTOR', <ReportsRoutes />)} />
      <Route path='serviceValidation/*' element={check('READ_SERVICE_VALIDATION')} >
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
      <Route path='videoCallQoe' element={check('READ_VIDEO_CALL_QOE')}>
        <Route index element={<VideoCallQoe />} />
        <Route path=':testId' element={<VideoCallQoeDetails/>} />
        <Route path='add' element={<VideoCallQoeForm />} />
      </Route>
      <Route path='occupancy' element={check('READ_OCCUPANCY', <div>Occupancy</div>)} />
      <Route path='search/:searchVal' element={<SearchResults />} />
      <Route path='admin'>
        <Route path='onboarded'
          element={check('READ_ONBOARDED_SYSTEMS',
            <AccountManagement tab={AccountManagementTabEnum.ONBOARDED_SYSTEMS}/>
          )}
        />
        <Route path='users'
          element={check('READ_USERS',
            <AccountManagement tab={AccountManagementTabEnum.USERS}/>
          )}
        />
        <Route path='support'
          element={check('READ_SUPPORT',
            <AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>
          )}
        />
        <Route path='developers'
          element={<AccountManagement tab={AccountManagementTabEnum.DEVELOPERS}/>}
        >
          <Route path='webhooks'
            element={check('READ_WEBHOOKS',
              <AccountManagement tab={AccountManagementTabEnum.WEBHOOKS}/>
            )}
          />
          <Route path='applicationTokens'
            element={<AccountManagement tab={AccountManagementTabEnum.APPLICATION_TOKENS}/>}
          />
        </Route>
        <Route path='webhooks'
          element={check('READ_WEBHOOKS',
            <AccountManagement tab={AccountManagementTabEnum.WEBHOOKS}/>
          )}
        />
      </Route>
      <Route path='health' element={check('READ_HEALTH')}>
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
      <Route path='devices/switch' element={check('READ_SWITCH_LIST')}>
        <Route path='' element={<Wired tab={AISwitchTabsEnum.SWITCH_LIST}/>} />
        <Route path='reports/wired'
          element={<Wired tab={AISwitchTabsEnum.WIRED_REPORT}/>} />
        <Route path=':switchId/:serial/details/:activeTab' element={<SwitchDetails/>} />
      </Route>
      <Route path='users'>
        <Route path='wifi/clients'
          element={check(
            'READ_WIRELESS_CLIENTS_LIST',
            <Clients tab={AIClientsTabEnum.CLIENTS}/>
          )} />
        <Route path='wifi/reports'
          element={check(
            'READ_WIRELESS_CLIENTS_REPORT',
            <Clients tab={AIClientsTabEnum.REPORTS}/>
          )} />
        <Route path='wifi/clients/:clientId' element={check('READ_CLIENT_TROUBLESHOOTING')}>
          <Route path=':activeTab'>
            <Route path=':activeTab' element={<ClientDetails />} />
            <Route path=':activeTab/:activeSubTab' element={<ClientDetails />} />
          </Route>
        </Route>
      </Route>
      <Route path='zones' element={check('READ_ZONES')}>
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
