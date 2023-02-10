import { useIntl } from 'react-intl'

import {
  HealthPage,
  IncidentListPage
}                                            from '@acx-ui/analytics/components'
import { useIsTierAllowed }                  from '@acx-ui/feature-toggle'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import IncidentDetailsPage        from './pages/IncidentDetails'
import NetworkHealthDetails       from './pages/NetworkHealth/NetworkHealthDetails'
import NetworkHealthForm          from './pages/NetworkHealth/NetworkHealthForm'
import { NetworkHealthSpecGuard } from './pages/NetworkHealth/NetworkHealthForm/NetworkHealthSpecGuard'
import NetworkHealthList          from './pages/NetworkHealth/NetworkHealthList'
import VideoCallQoePage           from './pages/VideoCallQoe'

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

      {useIsTierAllowed('ANLT-ADV') && <Route path='serviceValidation'>
        <Route path=''
          element={<TenantNavigate replace to='./serviceValidation/networkHealth' />}
        />
        <Route path='networkHealth' element={<NetworkHealthList />} />
        <Route path='networkHealth/add' element={<NetworkHealthForm />} />
        <Route path='networkHealth/:specId'>
          <Route
            path='edit'
            element={<NetworkHealthSpecGuard children={<NetworkHealthForm />} />}
          />
          <Route path='tests/:testId'>
            <Route path='' element={<NetworkHealthDetails />} />
            <Route path='tab/:activeTab' element={<NetworkHealthDetails />} />
          </Route>
        </Route>
        <Route path='videoCallQoe' element={<VideoCallQoePage />} />
      </Route>}
    </Route>
  )
  return (
    <Provider>{routes}</Provider>
  )
}
