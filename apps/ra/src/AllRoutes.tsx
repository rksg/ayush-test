import { Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'

import Incidents from './pages/Incidents'
import Layout    from './pages/Layout'
import { Recommendations } from '@acx-ui/analytics/components'
import ConfigChange    from './pages/ConfigChange'
import IncidentDetails from './pages/IncidentDetails'

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
    </Route>
  </Route>)
}

export default AllRoutes
