import { Route, rootRoutes, Navigate } from '@acx-ui/react-router-dom'

import AnalyticsBase from './pages/Analytics'

function AllRoutes () {
  return rootRoutes(<>
    <Route path='/' element={<Navigate replace to='/analytics/next' />} />
    <Route path='analytics/next' element={<AnalyticsBase />}/>
  </>)
}

export default AllRoutes
