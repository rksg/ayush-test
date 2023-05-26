import React from 'react'

import { Route, rootRoutes } from '@acx-ui/react-router-dom'

import AnalyticsBase from './pages/Analytics'

function AllRoutes () {
  return rootRoutes(
    <Route path='/analytics/next' element={<AnalyticsBase />}/>
  )
}

export default AllRoutes
