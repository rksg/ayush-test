import { RecommendationDetails, NetworkAssurance, NetworkAssuranceTabEnum } from '@acx-ui/analytics/components'
import { Route, rootRoutes, Navigate, MLISA_BASE_PATH }                     from '@acx-ui/react-router-dom'

import ConfigChange    from './pages/ConfigChange'
import IncidentDetails from './pages/IncidentDetails'
import Incidents       from './pages/Incidents'
import Layout          from './pages/Layout'
import Recommendations from './pages/Recommendations'

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to={MLISA_BASE_PATH} />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='dashboard' element={<div>dashboard</div>} />
      <Route path='recommendations'>
        <Route path=':activeTab' element={<Recommendations/>} />
        <Route path=':activeTab/:id' element={<RecommendationDetails />} />
      </Route>
      <Route path='incidents'>
        <Route index={true} element={<Incidents />} />
        <Route index={false} path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='configChange' element={<ConfigChange />} />
      <Route path='serviceValidation' element={<div>Service Validation</div>} />
      <Route path='videoCallQoe' element={<div>video Call Qoe</div>} />
      <Route path='occupancy' element={<div>Occupancy</div>} />
      <Route path='dataStudio' element={<div>Data Studio</div>} />
      <Route path='reports' element={<div>Reports</div>} />
      <Route path='admin/*' element={<div>Admin</div>} />
      <Route path='health'>
        <Route index={true} element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />} />
        <Route index={false}
          path='tab/:categoryTab'
          element={<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />} />
      </Route>
    </Route>
  </Route>)
}

export default AllRoutes
