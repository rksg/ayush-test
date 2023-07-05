import React from 'react'

import { useIntl } from 'react-intl'

import {
  AIAnalytics,
  AIAnalyticsTabEnum,
  HealthPage,
  IncidentDetails,
  IncidentListPage,
  IncidentListPageLegacy
}                                                   from '@acx-ui/analytics/components'
import { PageNotFound }                             from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { rootRoutes, Route, TenantNavigate }        from '@acx-ui/react-router-dom'
import { Provider }                                 from '@acx-ui/store'
import { hasAccess }                                from '@acx-ui/user'

import { NetworkAssurance, NetworkAssuranceTabEnum }    from './pages/NetworkAssurance'
import { ServiceGuard }                                 from './pages/ServiceGuard'
import ServiceGuardDetails                              from './pages/ServiceGuard/ServiceGuardDetails'
import ServiceGuardForm                                 from './pages/ServiceGuard/ServiceGuardForm'
import { ServiceGuardSpecGuard, ServiceGuardTestGuard } from './pages/ServiceGuard/ServiceGuardGuard'
import { VideoCallQoe }                                 from './pages/VideoCallQoe'
import { VideoCallQoeForm }                             from './pages/VideoCallQoe/VideoCallQoeForm/VideoCallQoeForm'
import { VideoCallQoeDetails }                          from './pages/VideoCallQoeDetails'

export default function AnalyticsRoutes () {
  const { $t } = useIntl()
  const canUseAnltAdv = useIsTierAllowed('ANLT-ADV')
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const isVideoCallQoeEnabled = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const isConfigChangeEnabled = useIsSplitOn(Features.CONFIG_CHANGE)

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!hasAccess()) return <React.Fragment />

  const routes = rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='analytics' element={<TenantNavigate replace to='/analytics/incidents' />} />
      <Route path='analytics/incidents'
        element={isNavbarEnhanced
          ? (!canUseAnltAdv
            ? <IncidentListPage />
            : <AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS} />)
          : <IncidentListPageLegacy />}
      />
      {!isNavbarEnhanced &&
        <Route path='analytics/incidents/tab/:activeTab' element={<IncidentListPageLegacy />} />}
      <Route path='analytics/incidents/:incidentId' element={<IncidentDetails />} />
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
      {isNavbarEnhanced && canUseAnltAdv && isConfigChangeEnabled &&
        <Route path='analytics/configChange'
          element={<AIAnalytics tab={AIAnalyticsTabEnum.CONFIG_CHANGE} />} />}
      {canUseAnltAdv && <Route>
        <Route path='analytics/serviceValidation/*' >
          <Route index
            element={isNavbarEnhanced
              ? <NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD} />
              : <ServiceGuard/>} />
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
              : <VideoCallQoe/>} />
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
