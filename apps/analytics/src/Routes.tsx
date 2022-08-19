import { useIntl } from 'react-intl'

import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { AnalyticsFilterProvider } from '@acx-ui/analytics/utils'
import IncidentDetailsPage from './pages/IncidentDetails'
import IncidentListPage    from './pages/Incidents'

export default function AnalyticsRoutes () {
  const { $t } = useIntl()
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='analytics' element={<TenantNavigate replace to='/analytics/incidents' />} />
      <Route path='analytics/incidents' element={<IncidentListPage />} />
      <Route path='analytics/incidents/:incidentId' element={<IncidentDetailsPage />} />
      <Route path='analytics/recommendations'
        element={<div>{ $t({ defaultMessage: 'Recommendations' }) } </div>} />
      <Route path='analytics/health'
        element={<div>{$t({ defaultMessage: 'Health' }) }</div>} />
      <Route path='analytics/configChange'
        element={<div>{$t({ defaultMessage: 'Config Change' }) }</div>} />
    </Route>
  )
  return (
    <Provider><AnalyticsFilterProvider children={routes} /></Provider>
  )
}
