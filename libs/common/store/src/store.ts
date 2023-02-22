import { configureStore, isRejectedWithValue }            from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { dataApi, networkHealthApi } from '@acx-ui/analytics/services'
import {
  baseCommonApi as commonApi,
  baseNetworkApi as networkApi,
  baseVenueApi as venueApi,
  baseEventAlarmApi as eventAlarmApi,
  baseTimelineApi as timelineApi,
  baseServiceApi as serviceApi,
  apApi,
  baseUserApi as userApi,
  baseDhcpApi as dhcpApi,
  baseMspApi as mspApi,
  baseEdgeApi as edgeApi,
  basePolicyApi as policyApi,
  baseClientApi as clientApi,
  baseSwitchApi as switchApi,
  baseMfaApi as mfaApi,
  baseAdministrationApi as administrationApi,
  baseEdgeDhcpApi as edgeDhcpApi,
  basePersonaApi as personaApi,
  baseNsgApi as nsgApi
} from '@acx-ui/rc/services'

import type { Middleware } from '@reduxjs/toolkit'

type ErrorAction = {
  type: string,
  meta: {
    baseQueryMeta: {
      response: {
        status: number
      }
    }
  },
  payload: {
    data?: {
      error: string
    }
  }
}

const errorMiddleware: Middleware = () => (next) => (action: ErrorAction) => {
  if (isRejectedWithValue(action)) {
    const status = action.meta.baseQueryMeta.response.status
    const error = action.payload.data?.error
    if (
      (status === 400 && error === 'API-KEY not present') ||
      status === 401 || status === 403
    ) {
      sessionStorage.removeItem('jwt')
      window.location.href = '/logout'
    }
  }
  return next(action)
}

const isDev = process.env['NODE_ENV'] === 'development'
const isProd = process.env['NODE_ENV'] === 'production'

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
    [edgeApi.reducerPath]: edgeApi.reducer,
    [policyApi.reducerPath]: policyApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [switchApi.reducerPath]: switchApi.reducer,
    [networkHealthApi.reducerPath]: networkHealthApi.reducer,
    [mfaApi.reducerPath]: mfaApi.reducer,
    [administrationApi.reducerPath]: administrationApi.reducer,
    [edgeDhcpApi.reducerPath]: edgeDhcpApi.reducer,
    [personaApi.reducerPath]: personaApi.reducer,
    [networkHealthApi.reducerPath]: networkHealthApi.reducer,
    [nsgApi.reducerPath]: nsgApi.reducer
  },

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: isDev ? undefined : false,
      immutableCheck: isDev ? undefined : false
    }).concat([
      ...(isProd ? [errorMiddleware] : []),
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
      edgeApi.middleware,
      policyApi.middleware,
      clientApi.middleware,
      switchApi.middleware,
      networkHealthApi.middleware,
      mfaApi.middleware,
      administrationApi.middleware,
      edgeDhcpApi.middleware,
      personaApi.middleware,
      networkHealthApi.middleware,
      nsgApi.middleware
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
