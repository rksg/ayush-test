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

import IncidentDetailsPage                              from './pages/IncidentDetails'
import ServiceGuard                                     from './pages/ServiceGuard'
import ServiceGuardDetails                              from './pages/ServiceGuard/ServiceGuardDetails'
import ServiceGuardForm                                 from './pages/ServiceGuard/ServiceGuardForm'
import { ServiceGuardSpecGuard, ServiceGuardTestGuard } from './pages/ServiceGuard/ServiceGuardGuard'
import ServiceGuardList                                 from './pages/ServiceGuard/ServiceGuardList'
import VideoCallQoeListPage                             from './pages/VideoCallQoe'
import { VideoCallQoeForm }                             from './pages/VideoCallQoe/VideoCallQoeForm/VideoCallQoeForm'
import { VideoCallQoeDetails }                          from './pages/VideoCallQoeDetails'

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
        <Route path='analytics/serviceValidation/*' element={<ServiceGuard />}>
          <Route path='' element={<ServiceGuardList />} />
          <Route path='add' element={<ServiceGuardForm />} />
          <Route path=':specId'>
            <Route
              path='edit'
              element={<ServiceGuardSpecGuard children={<ServiceGuardForm />} />}
            />
            <Route path='tests/:testId'>
              <Route
                path=''
                element={<ServiceGuardTestGuard children={<ServiceGuardDetails />} />}
              />
              <Route
                path='tab/:activeTab'
                element={<ServiceGuardTestGuard children={<ServiceGuardDetails />} />}
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
