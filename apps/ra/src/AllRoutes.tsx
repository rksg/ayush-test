import { Route, rootRoutes, Navigate } from '@acx-ui/react-router-dom'

import AnalyticsBase from './pages/Analytics'
import Layout        from './pages/Layout'

function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to='/analytics/next' />} />
    <Route path='analytics/next' element={<AnalyticsBase />}/>
  </Route>)
}

export default AllRoutes
