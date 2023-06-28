import { Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'

import ConfigChange    from './pages/ConfigChange'
import { HealthPage }  from './pages/Health'
import IncidentDetails from './pages/IncidentDetails'
import Incidents       from './pages/Incidents'
import Layout          from './pages/Layout'

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to={MLISA_BASE_PATH} />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='' element={<Navigate replace to='incidents' />} />
      <Route path='dashboard' element={<div>dashboard</div>} />
      <Route path='incidents'>
        <Route index={true} element={<Incidents />} />
        <Route index={false} path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='recommendations' element={<div>Recommendations</div>} />
      <Route path='configChange' element={<ConfigChange />} />
      <Route path='serviceValidation' element={<div>Service Validation</div>} />
      <Route path='videoCallQoe' element={<div>video Call Qoe</div>} />
      <Route path='occupancy' element={<div>Occupancy</div>} />
      <Route path='dataStudio' element={<div>Data Studio</div>} />
      <Route path='reports' element={<div>Reports</div>} />
      <Route path='admin/*' element={<div>Admin</div>} />
    </Route>
    <Route path='health'>
      <Route index={true} element={<HealthPage />} />
      <Route index={false} path='tab/:categoryTab' element={<HealthPage />} />
    </Route>
    <Route path='serviceValidation' element={<div>Service Validation</div>} />
    <Route path='videoCallQoe' element={<div>video Call Qoe</div>} />
    <Route path='occupancy' element={<div>Occupancy</div>} />
    <Route path='dataStudio' element={<div>Data Studio</div>} />
    <Route path='reports' element={<div>Reports</div>} />
    <Route path='admin/*' element={<div>Admin</div>} />
  </Route>)
}

export default AllRoutes
