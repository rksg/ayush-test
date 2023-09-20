import React from 'react'

import {
  RecommendationDetails,
  NetworkAssurance,
  NetworkAssuranceTabEnum,
  CrrmDetails,
  VideoCallQoeForm,
  VideoCallQoeDetails
}                                                       from '@acx-ui/analytics/components'
import { Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'

import ClientDetails   from './pages/ClientDetails'
import ConfigChange    from './pages/ConfigChange'
import IncidentDetails from './pages/IncidentDetails'
import Incidents       from './pages/Incidents'
import Layout          from './pages/Layout'
import Recommendations from './pages/Recommendations'
import SearchResults   from './pages/SearchResults'

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const ReportsRoutes = React.lazy(() => import('@reports/Routes'))

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to={`${MLISA_BASE_PATH}/dashboard`} />} />
    <Route
      path={MLISA_BASE_PATH}
      element={<Navigate replace to={`${MLISA_BASE_PATH}/dashboard`} />}
    />
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
      <Route path='configChange' element={<ConfigChange />} />
      <Route path='reports/*' element={<ReportsRoutes />} />
      <Route path='dataStudio/*' element={<ReportsRoutes />} />
      <Route path='serviceValidation' element={<div>Service Validation</div>} />
      <Route path='videoCallQoe' >
        <Route index element={<NetworkAssurance tab={NetworkAssuranceTabEnum.VIDEO_CALL_QOE} />} />
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
      <Route path='users'>
        <Route path='wifi/clients'>
          <Route path=':clientId'>
            <Route path=':activeTab' element={<ClientDetails />}>
              <Route path='' element={<Navigate replace to='./overview' />} />
              <Route path=':activeTab' element={<ClientDetails />} />
              <Route path=':activeTab/:activeSubTab' element={<ClientDetails />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  </Route>)
}

export default AllRoutes
