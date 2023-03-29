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
  dataApi,
  networkHealthApi,
  userApi
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
    [apApi.reducerPath]: apApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
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
    [edgeDhcpApi.reducerPath]: edgeDhcpApi.reducer,
    [personaApi.reducerPath]: personaApi.reducer,
    [networkHealthApi.reducerPath]: networkHealthApi.reducer,
    [nsgApi.reducerPath]: nsgApi.reducer,
    [tunnelProfileApi.reducerPath]: tunnelProfileApi.reducer
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
      apApi.middleware,
      userApi.middleware,
      dataApi.middleware,
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
      edgeDhcpApi.middleware,
      personaApi.middleware,
      networkHealthApi.middleware,
      nsgApi.middleware,
      tunnelProfileApi.middleware
    ])
  },

  devTools: !isDev
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function baseSelector (state: AppState) {
  return state
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
