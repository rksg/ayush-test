import React from 'react'

import {
  AIAnalytics,
  AIAnalyticsTabEnum,
  HealthPage,
  HealthPageWithTabs,
  HealthTabEnum,
  IncidentDetails,
  NetworkAssurance,
  NetworkAssuranceTabEnum,
  ServiceGuardDetails,
  ServiceGuardForm,
  ServiceGuardSpecGuard,
  ServiceGuardTestGuard,
  VideoCallQoeForm,
  VideoCallQoeDetails,
  IntentAIForm,
  IntentAIDetails
} from '@acx-ui/analytics/components'
import { PageNotFound }                             from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { rootRoutes, Route, TenantNavigate }        from '@acx-ui/react-router-dom'
import { Provider }                                 from '@acx-ui/store'
import { RolesEnum }                                from '@acx-ui/types'
import { hasRoles }                                 from '@acx-ui/user'

export default function AnalyticsRoutes () {
  const canUseAnltAdv = useIsTierAllowed('ANLT-ADV')
  const isConfigChangeEnabled = useIsSplitOn(Features.CONFIG_CHANGE)
  const isSwitchHealthEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_TOGGLE)
  ].some(Boolean)

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (hasRoles([RolesEnum.GUEST_MANAGER, RolesEnum.DPSK_ADMIN]) ) return <React.Fragment />

  const HealthComponent = !canUseAnltAdv
    ? <HealthPage/>
    : <NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH} />

  const routes = rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='analytics' element={<TenantNavigate replace to='/analytics/incidents' />} />
      <Route path='analytics/incidents'
        element={<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS} />}
      />
      <Route path='analytics/incidents/:incidentId' element={<IncidentDetails />} />
      <Route path='analytics/intentAI'>
        <Route index element={<AIAnalytics tab={AIAnalyticsTabEnum.INTENTAI} />} />
        <Route path=':sliceId/:code' element={<IntentAIDetails />} />
        <Route path=':sliceId/:code/edit' element={<IntentAIForm />} />
      </Route>
      {isSwitchHealthEnabled
        ? <Route
          path='analytics/health'
          element={<TenantNavigate replace to='/analytics/health/overview' />}
        />
        : <Route path='analytics/health' element={HealthComponent} />
      }
      <Route path='analytics/health/:activeSubTab' element={HealthComponent}>
        <Route path='tab/:categoryTab' element={HealthComponent} />
      </Route>
      {
        // Below routes are used for Health page loaded as top level tabs
        isSwitchHealthEnabled && !canUseAnltAdv &&
        <Route path='analytics/health/'>
          {/* Below index route is added for Backward compatibility */}
          <Route index element={<HealthPageWithTabs tab={HealthTabEnum.WIRELESS} />} />
          {Object.values(HealthTabEnum).map(tab => (
            <Route key={tab} path={tab} element={<HealthPageWithTabs tab={tab}/>}>
              <Route path='tab/:categoryTab' element={<HealthPageWithTabs tab={tab}/>} />
            </Route>
          ))}
        </Route>
      }

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
        <Route path='analytics/videoCallQoe/*' >
          <Route index
            element={<NetworkAssurance tab={NetworkAssuranceTabEnum.VIDEO_CALL_QOE} />} />
          <Route path=':testId' element={<VideoCallQoeDetails/>} />
          <Route path='add' element={<VideoCallQoeForm />} />
        </Route>
      </Route>}
    </Route>
  )
  return (
    <Provider>{routes}</Provider>
  )
}
