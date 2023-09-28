import React, { useEffect } from 'react'

import {
  RecommendationDetails,
  NetworkAssurance,
  NetworkAssuranceTabEnum,
  CrrmDetails,
  VideoCallQoe,
  VideoCallQoeForm,
  VideoCallQoeDetails
} from '@acx-ui/analytics/components'
import { useUserProfileContext, PERMISSION_VIEW_ANALYTICS }              from '@acx-ui/analytics/utils'
import { showToast }                                                     from '@acx-ui/components'
import { useSearchParams, Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'

import ClientDetails                 from './pages/ClientDetails'
import Clients, { AIClientsTabEnum } from './pages/Clients'
import ConfigChange                  from './pages/ConfigChange'
import IncidentDetails               from './pages/IncidentDetails'
import Incidents                     from './pages/Incidents'
import Layout                        from './pages/Layout'
import Recommendations               from './pages/Recommendations'
import SearchResults                 from './pages/SearchResults'
import { WiFiPage, WifiTabsEnum }    from './pages/Wifi'
import ApDetails                     from './pages/Wifi/ApDetails'
import Wired, { AISwitchTabsEnum }   from './pages/Wired'
import SwitchDetails                 from './pages/Wired/SwitchDetails'

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const ReportsRoutes = React.lazy(() => import('@reports/Routes'))

function Init () {
  const { data: { invitations, permissions, accountId } } = useUserProfileContext()
  const [ search ] = useSearchParams()
  const previousURL = search.get('return')!
  useEffect(() => {
    if (invitations.length > 0 /*|| tenants.length > 1*/) {
      showToast({ // TODO open account drawer instead
        type: 'success',
        content: <div>
          You have pending invitations,&nbsp;
          <u><a href='/analytics/profile/tenants' target='_blank' style={{ color: 'white' }}>
            please click here to view them
          </a></u>
        </div>
      })
    }
  })
  const selectedTenants = search.get('selectedTenants') || window.btoa(JSON.stringify([accountId]))
  return <Navigate
    replace
    to={{
      search: `?selectedTenants=${selectedTenants}`,
      pathname: previousURL
        ? decodeURIComponent(previousURL)
        : permissions[PERMISSION_VIEW_ANALYTICS]
          ? `${MLISA_BASE_PATH}/dashboard`
          : `${MLISA_BASE_PATH}/reports`
    }} />
}

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Init />} />
    <Route path={MLISA_BASE_PATH} element={<Init />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='recommendations'>
        <Route path=':activeTab' element={<Recommendations/>} />
        <Route path='aiOps/:id' element={<RecommendationDetails />} />
        <Route path='crrm/:id' element={<CrrmDetails />} />
      </Route>
      <Route path='incidents'>
        <Route index={true} element={<Incidents />} />
        <Route index={false} path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='wifi'>
        <Route index={true}
          element={<WiFiPage tab={WifiTabsEnum.LIST} />} />
        <Route
          path='reports/aps'
          element={<WiFiPage tab={WifiTabsEnum.AP_REPORT} />} />
        <Route
          path='reports/airtime'
          element={<WiFiPage tab={WifiTabsEnum.AIRTIME_REPORT} />} />
        <Route
          path=':apId/details/reports'
          element={<ApDetails />} />
      </Route>
      <Route path='configChange' element={<ConfigChange />} />
      <Route path='reports/*' element={<ReportsRoutes />} />
      <Route path='dataStudio/*' element={<ReportsRoutes />} />
      <Route path='serviceValidation' element={<div>Service Validation</div>} />
      <Route path='videoCallQoe' >
        <Route index element={<VideoCallQoe />} />
        <Route path=':testId' element={<VideoCallQoeDetails/>} />
        <Route path='add' element={<VideoCallQoeForm />} />
      </Route>
      <Route path='occupancy' element={<div>Occupancy</div>} />
      <Route path='search/:searchVal' element={<SearchResults />} />
      <Route path='admin/*' element={<div>Admin</div>} />
      <Route path='health'>
        <Route index={true} element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />} />
        <Route index={false}
          path='tab/:categoryTab'
          element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />} />
      </Route>
      <Route path='switch' element={<Wired tab={AISwitchTabsEnum.SWITCH_LIST}/>} />
      <Route path='switch/reports/wired'
        element={<Wired tab={AISwitchTabsEnum.WIRED_REPORT}/>} />
      <Route path='switch/:switchId/details' element={<SwitchDetails/>} />
      <Route path='users'>
        <Route path='wifi/clients' element={<Clients tab={AIClientsTabEnum.CLIENTS}/>} />
        <Route path='wifi/reports' element={<Clients tab={AIClientsTabEnum.REPORTS}/>} />
        <Route path='wifi/clients/:clientId'>
          <Route path=':activeTab'>
            <Route path='' element={<Navigate replace to='./troubleshooting' />} />
            <Route path=':activeTab' element={<ClientDetails />} />
            <Route path=':activeTab/:activeSubTab' element={<ClientDetails />} />
          </Route>
        </Route>
      </Route>
    </Route>
  </Route>)
}

export default AllRoutes
