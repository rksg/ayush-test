import { Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'

import Incidents from './pages/Incidents'
import Layout    from './pages/Layout'

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to={MLISA_BASE_PATH} />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='' element={<Navigate replace to='incidents' />} />
      <Route path='dashboard' element={<div>dashboard</div>} />
      <Route path='incidents' element={<Incidents />} />
    </Route>
  </Route>)
}

export default AllRoutes
