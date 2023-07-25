import React from 'react'

import { Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'

import ConfigChange    from './pages/ConfigChange'
import IncidentDetails from './pages/IncidentDetails'
import Incidents       from './pages/Incidents'
import Layout          from './pages/Layout'
import Recommendations from './pages/Recommendations'

const ReportsRoutes = React.lazy(() => import('@reports/Routes'))
function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to={MLISA_BASE_PATH} />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='dashboard' element={<div>dashboard</div>} />
      <Route path='recommendations' element={<Recommendations />} />
      <Route path='incidents'>
        <Route index={true} element={<Incidents />} />
        <Route index={false} path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='configChange' element={<ConfigChange />} />
      <Route path='reports/*' element={<ReportsRoutes />} />
      <Route path='dataStudio/*' element={<ReportsRoutes />} />
    </Route>
    <Route path='health' element={<div>Health</div>} />
    <Route path='serviceValidation' element={<div>Service Validation</div>} />
    <Route path='occupancy' element={<div>Occupancy</div>} />
    <Route path='admin/*' element={<div>Admin</div>} />
  </Route>)
}

export default AllRoutes
