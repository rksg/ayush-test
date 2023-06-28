import { Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'

import ConfigChange          from './pages/ConfigChange'
import IncidentDetails       from './pages/IncidentDetails'
import Incidents             from './pages/Incidents'
import Layout                from './pages/Layout'
import RecommendationDetails from './pages/RecommendationDetails'

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to={MLISA_BASE_PATH} />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='' element={<Navigate replace to='incidents' />} />
      <Route path='dashboard' element={<div>dashboard</div>} />
      <Route path='recommendations'>
        <Route index={true} element={<div>recommendation list</div>} />
        <Route index={false} path=':id' element={<RecommendationDetails />} />
      </Route>
      <Route path='incidents'>
        <Route index={true} element={<Incidents />} />
        <Route index={false} path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='configChange' element={<ConfigChange />} />
    </Route>
  </Route>)
}

export default AllRoutes
