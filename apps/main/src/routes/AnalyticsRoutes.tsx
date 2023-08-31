import React from 'react'

import {
  AIAnalytics,
  AIAnalyticsTabEnum,
  HealthPage,
  IncidentDetails,
  IncidentListPage,
  NetworkAssurance,
  NetworkAssuranceTabEnum,
  RecommendationDetails,
  ServiceGuardDetails,
  ServiceGuardForm,
  ServiceGuardSpecGuard,
  ServiceGuardTestGuard,
  VideoCallQoeForm,
  VideoCallQoeDetails
}                                                   from '@acx-ui/analytics/components'
import { PageNotFound }                             from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { rootRoutes, Route, TenantNavigate }        from '@acx-ui/react-router-dom'
import { Provider }                                 from '@acx-ui/store'
import { hasAccess }                                from '@acx-ui/user'

export default function AnalyticsRoutes () {
  const canUseAnltAdv = useIsTierAllowed('ANLT-ADV')
  const isVideoCallQoeEnabled = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const isConfigChangeEnabled = useIsSplitOn(Features.CONFIG_CHANGE)
  const recommendationsEnabled = useIsSplitOn(Features.AI_RECOMMENDATIONS)
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!hasAccess()) return <React.Fragment />

  const routes = rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='analytics' element={<TenantNavigate replace to='/analytics/incidents' />} />
      <Route path='analytics/incidents'
        element={(!canUseAnltAdv
          ? <IncidentListPage />
          : <AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS} />)}
      />
      <Route path='analytics/incidents/:incidentId' element={<IncidentDetails />} />
      <Route path='analytics/health'
        element={(!canUseAnltAdv
          ? <HealthPage/>
          : <NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />)}
      />
      <Route path='analytics/health/tab/:categoryTab'
        element={(!canUseAnltAdv
          ? <HealthPage/>
          : <NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />)
        } />
      {canUseAnltAdv && recommendationsEnabled &&
      <Route path='analytics/recommendations/'>
        <Route path=':activeTab' element={<AIAnalytics />} />
        <Route path=':activeTab/:id' element={<RecommendationDetails />} />
      </Route>}
      {canUseAnltAdv && isConfigChangeEnabled &&
        <Route path='analytics/configChange'
          element={<NetworkAssurance tab={NetworkAssuranceTabEnum.CONFIG_CHANGE} />} />}
      {canUseAnltAdv && <Route>
        <Route path='analytics/serviceValidation/*' >
          <Route index
            element={<NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD} />} />
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
            element={<NetworkAssurance tab={NetworkAssuranceTabEnum.VIDEO_CALL_QOE} />} />
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
