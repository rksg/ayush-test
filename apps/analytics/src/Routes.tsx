import { useIntl } from 'react-intl'

import {
  HealthPage,
  IncidentListPage,
  NetworkHealthPage,
  VideoCallQoePage
}                                            from '@acx-ui/analytics/components'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import IncidentDetailsPage from './pages/IncidentDetails'

export default function AnalyticsRoutes () {
  const { $t } = useIntl()
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='analytics' element={<TenantNavigate replace to='/analytics/incidents' />} />
      <Route path='analytics/incidents' element={<IncidentListPage />} />
      <Route path='analytics/incidents/tab/:activeTab' element={<IncidentListPage />} />
      <Route path='analytics/incidents/:incidentId' element={<IncidentDetailsPage />} />
      <Route path='analytics/recommendations'
        element={<div>{ $t({ defaultMessage: 'Recommendations' }) } </div>} />
      <Route path='analytics/health' element={<HealthPage />} />
      <Route path='analytics/health/tab/:categoryTab' element={<HealthPage />} />
      <Route path='analytics/configChange'
        element={<div>{$t({ defaultMessage: 'Config Change' }) }</div>} />
      <Route path='serviceValidation'
        element={<TenantNavigate replace to='/serviceValidation/networkHealth' />} />
      <Route path='serviceValidation/networkHealth' element={<NetworkHealthPage />} />
      <Route path='serviceValidation/networkHealth/tab/:activeTab'
        element={<NetworkHealthPage />} />
      <Route path='serviceValidation/videoCallQoe' element={<VideoCallQoePage />} />
    </Route>
  )
  return (
    <Provider>{routes}</Provider>
  )
}
