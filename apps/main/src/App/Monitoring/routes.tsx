import React from 'react'

import { Route, TenantNavigate } from '@acx-ui/react-router-dom'

import { Summary }  from './Summary'
import { Topology } from './Topology'

import { Monitoring } from '.'

function monitoringRoutes () {
  return (
    <Route path='monitoring' element={<Monitoring />}>
      <Route index element={<TenantNavigate to='/monitoring/summary' />} />
      <Route path='summary' element={<Summary />} />
      <Route path='topology' element={<Topology />} />
    </Route>
  )
}

export default monitoringRoutes
