import { configureStore }                                 from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import dynamicMiddlewares                                 from 'redux-dynamic-middlewares'

import {
  baseAdministrationApi as administrationApi ,
  baseApApi as apApi,
  baseClientApi as clientApi,
  baseCommonApi as commonApi,
  baseDhcpApi as dhcpApi,
  baseEdgeApi as edgeApi ,
  baseEdgeDhcpApi as edgeDhcpApi,
  baseEventAlarmApi as eventAlarmApi,
  baseFirmwareApi as firmwareApi,
  baseMigrationApi as migrationApi,
  baseLicenseApi as licenseApi,
  baseMspApi as mspApi,
  baseNetworkApi as networkApi,
  baseNsgApi as nsgApi,
  basePersonaApi as personaApi,
  basePolicyApi as policyApi,
  baseServiceApi as serviceApi,
  baseSwitchApi as switchApi,
  baseTimelineApi as timelineApi,
  baseVenueApi as venueApi,
  baseTunnelProfileApi as tunnelProfileApi,
  baseResidentPortalApi as residentPortalApi,
  baseConnectionMeteringApi as connectionMeteringApi,
  dataApi,
  dataApiSearch,
  recommendationApi,
  serviceGuardApi,
  reportsApi,
  userApi,
  baseMsgTemplateApi as msgTemplateApi,
  videoCallQoeApi,
  baseEdgeFirewallApi as edgeFirewallApi,
  baseSigPackApi as sigPackApi,
  baseRWGApi as rwgApi
} from './baseApi'

const isDev = process.env['NODE_ENV'] === 'development'

export const store = configureStore({
  reducer: {
    [commonApi.reducerPath]: commonApi.reducer,
    [networkApi.reducerPath]: networkApi.reducer,
    [venueApi.reducerPath]: venueApi.reducer,
    [eventAlarmApi.reducerPath]: eventAlarmApi.reducer,
    [timelineApi.reducerPath]: timelineApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
    [dataApiSearch.reducerPath]: dataApiSearch.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [recommendationApi.reducerPath]: recommendationApi.reducer,
    [apApi.reducerPath]: apApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [dhcpApi.reducerPath]: dhcpApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [mspApi.reducerPath]: mspApi.reducer,
    [licenseApi.reducerPath]: licenseApi.reducer,
    [edgeApi.reducerPath]: edgeApi.reducer,
    [policyApi.reducerPath]: policyApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [switchApi.reducerPath]: switchApi.reducer,
    [administrationApi.reducerPath]: administrationApi.reducer,
    [firmwareApi.reducerPath]: firmwareApi.reducer,
    [migrationApi.reducerPath]: migrationApi.reducer,
    [edgeDhcpApi.reducerPath]: edgeDhcpApi.reducer,
    [personaApi.reducerPath]: personaApi.reducer,
    [serviceGuardApi.reducerPath]: serviceGuardApi.reducer,
    [nsgApi.reducerPath]: nsgApi.reducer,
    [tunnelProfileApi.reducerPath]: tunnelProfileApi.reducer,
    [msgTemplateApi.reducerPath]: msgTemplateApi.reducer,
    [connectionMeteringApi.reducerPath]: connectionMeteringApi.reducer,
    [videoCallQoeApi.reducerPath]: videoCallQoeApi.reducer,
    [edgeFirewallApi.reducerPath]: edgeFirewallApi.reducer,
    [sigPackApi.reducerPath]: sigPackApi.reducer,
    [residentPortalApi.reducerPath]: residentPortalApi.reducer,
    [rwgApi.reducerPath]: rwgApi.reducer
  },

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: isDev ? undefined : false,
      immutableCheck: isDev ? undefined : false
    }).concat([
      dynamicMiddlewares,
      commonApi.middleware,
      networkApi.middleware,
      venueApi.middleware,
      eventAlarmApi.middleware,
      timelineApi.middleware,
      dataApi.middleware,
      recommendationApi.middleware,
      dataApiSearch.middleware,
      apApi.middleware,
      userApi.middleware,
      dhcpApi.middleware,
      serviceApi.middleware,
      mspApi.middleware,
      licenseApi.middleware,
      edgeApi.middleware,
      policyApi.middleware,
      clientApi.middleware,
      switchApi.middleware,
      administrationApi.middleware,
      firmwareApi.middleware,
      migrationApi.middleware,
      edgeDhcpApi.middleware,
      personaApi.middleware,
      serviceGuardApi.middleware,
      nsgApi.middleware,
      tunnelProfileApi.middleware,
      msgTemplateApi.middleware,
      connectionMeteringApi.middleware,
      videoCallQoeApi.middleware,
      edgeFirewallApi.middleware,
      sigPackApi.middleware,
      residentPortalApi.middleware,
      rwgApi.middleware
    ])
  },

  devTools: isDev
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function baseSelector (state: AppState) {
  return state
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
