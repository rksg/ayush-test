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
      <Route path='recommendations' element={<div>Recommendations</div>} />
      <Route path='configChange' element={<div>Config Change</div>} />
      <Route path='health' element={<div>Health</div>} />
      <Route path='serviceValidation' element={<div>Service Validation</div>} />
      <Route path='videoCallQoe' element={<div>video Call Qoe</div>} />
      <Route path='occupancy' element={<div>Occupancy</div>} />
      <Route path='dataStudio' element={<div>Data Studio</div>} />
      <Route path='reports' element={<div>Reports</div>} />
      <Route path='admin/*' element={<div>Admin</div>} />
    </Route>
  </Route>)
}

export default AllRoutes
