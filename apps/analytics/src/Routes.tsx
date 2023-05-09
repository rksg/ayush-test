import React from 'react'

import { useIntl } from 'react-intl'

import {
  HealthPage,
  IncidentListPage
}                                            from '@acx-ui/analytics/components'
import { useIsTierAllowed }                  from '@acx-ui/feature-toggle'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'
import { hasAccess }                         from '@acx-ui/user'

import IncidentDetailsPage                                from './pages/IncidentDetails'
import NetworkHealth                                      from './pages/NetworkHealth'
import NetworkHealthDetails                               from './pages/NetworkHealth/NetworkHealthDetails'
import NetworkHealthForm                                  from './pages/NetworkHealth/NetworkHealthForm'
import { NetworkHealthSpecGuard, NetworkHealthTestGuard } from './pages/NetworkHealth/NetworkHealthGuard'
import NetworkHealthList                                  from './pages/NetworkHealth/NetworkHealthList'
import VideoCallQoeListPage                               from './pages/VideoCallQoe'
import { VideoCallQoeForm }                               from './pages/VideoCallQoe/VideoCallQoeForm/VideoCallQoeForm'
import { VideoCallQoeDetails }                            from './pages/VideoCallQoeDetails'

export default function AnalyticsRoutes () {
  const { $t } = useIntl()
  const canUseSV = useIsTierAllowed('ANLT-ADV')

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!hasAccess()) return <React.Fragment />

  const routes = rootRoutes(
    <Route path=':tenantId/t'>
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

      {canUseSV && <Route>
        <Route path='analytics/serviceValidation/*' element={<NetworkHealth />}>
          <Route path='' element={<NetworkHealthList />} />
          <Route path='add' element={<NetworkHealthForm />} />
          <Route path=':specId'>
            <Route
              path='edit'
              element={<NetworkHealthSpecGuard children={<NetworkHealthForm />} />}
            />
            <Route path='tests/:testId'>
              <Route
                path=''
                element={<NetworkHealthTestGuard children={<NetworkHealthDetails />} />}
              />
              <Route
                path='tab/:activeTab'
                element={<NetworkHealthTestGuard children={<NetworkHealthDetails />} />}
              />
            </Route>
          </Route>
        </Route>
        <Route path='analytics/videoCallQoe' element={<VideoCallQoeListPage />} />
        <Route path='analytics/videoCallQoe/:testId' element={<VideoCallQoeDetails/>} />
        <Route path='analytics/videoCallQoe/add' element={<VideoCallQoeForm />} />
      </Route>}
    </Route>
  )
  return (
    <Provider>{routes}</Provider>
  )
}
