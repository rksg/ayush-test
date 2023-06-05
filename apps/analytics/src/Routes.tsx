import React from 'react'

import { useIntl } from 'react-intl'

import {
  HealthPage,
  IncidentListPage,
  IncidentListPageLegacy
}                                                   from '@acx-ui/analytics/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { rootRoutes, Route, TenantNavigate }        from '@acx-ui/react-router-dom'
import { Provider }                                 from '@acx-ui/store'
import { hasAccess }                                from '@acx-ui/user'

import IncidentDetailsPage                              from './pages/IncidentDetails'
import { NetworkAssurance, NetworkAssuranceTabEnum }    from './pages/NetworkAssurance'
import { useServiceGuard }                              from './pages/ServiceGuard'
import ServiceGuardDetails                              from './pages/ServiceGuard/ServiceGuardDetails'
import ServiceGuardForm                                 from './pages/ServiceGuard/ServiceGuardForm'
import { ServiceGuardSpecGuard, ServiceGuardTestGuard } from './pages/ServiceGuard/ServiceGuardGuard'
import { useVideoCallQoe }                              from './pages/VideoCallQoe'
import { VideoCallQoeForm }                             from './pages/VideoCallQoe/VideoCallQoeForm/VideoCallQoeForm'
import { VideoCallQoeDetails }                          from './pages/VideoCallQoeDetails'

export default function AnalyticsRoutes () {
  const { $t } = useIntl()
  const canUseAnltAdv = useIsTierAllowed('ANLT-ADV')
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const isVideoCallQoeEnabled = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const videoCallQoePage = useVideoCallQoe().component
  const serviceGuardPage = useServiceGuard().component

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!hasAccess()) return <React.Fragment />

  const routes = rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='analytics' element={<TenantNavigate replace to='/analytics/incidents' />} />
      <Route path='analytics/incidents'
        element={isNavbarEnhanced ? <IncidentListPage /> : <IncidentListPageLegacy />}
      />
      {!isNavbarEnhanced &&
        <Route path='analytics/incidents/tab/:activeTab' element={<IncidentListPageLegacy />} />}
      <Route path='analytics/incidents/:incidentId' element={<IncidentDetailsPage />} />
      <Route path='analytics/recommendations'
        element={<div>{ $t({ defaultMessage: 'Recommendations' }) } </div>} />
      <Route path='analytics/health'
        element={isNavbarEnhanced
          ? (!canUseAnltAdv
            ? <HealthPage/>
            : <NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />)
          : <HealthPage/>} />
      <Route path='analytics/health/tab/:categoryTab'
        element={isNavbarEnhanced
          ? (!canUseAnltAdv
            ? <HealthPage/>
            : <NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />)
          : <HealthPage/>} />
      <Route path='analytics/configChange'
        element={<div>{$t({ defaultMessage: 'Config Change' }) }</div>} />
      {canUseAnltAdv && <Route>
        <Route path='analytics/serviceValidation/*' >
          <Route index
            element={isNavbarEnhanced
              ? <NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD} />
              : serviceGuardPage} />
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
        {isVideoCallQoeEnabled && <Route path='analytics/videoCallQoe/*' >
          <Route index
            element={isNavbarEnhanced
              ? <NetworkAssurance tab={NetworkAssuranceTabEnum.VIDEO_CALL_QOE} />
              : videoCallQoePage} />
          <Route path=':testId' element={<VideoCallQoeDetails/>} />
          <Route path='add' element={<VideoCallQoeForm />} />
        </Route>}
      </Route>}
    </Route>
  )
  return (
    <Provider>{routes}</Provider>
  )
}
