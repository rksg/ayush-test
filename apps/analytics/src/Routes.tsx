import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

export default function AnalyticsRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='analytics' element={<TenantNavigate replace to='/analytics/incidents' />} />
      <Route path='analytics/incidents' element={<div>Incidents</div>} />
      <Route path='analytics/recommendations' element={<div>Recommendations</div>} />
      <Route path='analytics/health' element={<div>Health</div>} />
      <Route path='analytics/configChange' element={<div>Config Change</div>} />
      <Route path='analytics/occupancy' element={<div>Occupancy</div>} />
    </Route>
  )
  return (
    <Provider children={routes} />
  )
}
