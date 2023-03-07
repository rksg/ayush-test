import { configureStore, isRejectedWithValue }            from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery }                      from '@reduxjs/toolkit/query/react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { baseAdministrationApi as administrationApi } from './baseApi/baseAdministrationApi'
import { baseApApi as apApi }                         from './baseApi/baseApApi'
import { baseClientApi as clientApi }                 from './baseApi/baseClientApi'
import { baseCommonApi as commonApi }                 from './baseApi/baseCommonApi'
import { baseDhcpApi as dhcpApi }                     from './baseApi/baseDhcpApi'
import { baseEdgeApi as edgeApi  }                    from './baseApi/baseEdgeApi'
import { baseEdgeDhcpApi as edgeDhcpApi }             from './baseApi/baseEdgeDhcpApi'
import { baseEventAlarmApi as eventAlarmApi }         from './baseApi/baseEventAlarmApi'
import { baseFirmwareApi as firmwareApi }             from './baseApi/baseFirmwareApi'
import { baseLicenseApi as licenseApi }               from './baseApi/baseLicenseApi'
import { baseMspApi as mspApi }                       from './baseApi/baseMspApi'
import { baseNetworkApi as networkApi }               from './baseApi/baseNetworkApi'
import { baseNsgApi as nsgApi }                       from './baseApi/baseNsgApi'
import { basePersonaApi as personaApi }               from './baseApi/basePersonaApi'
import { basePolicyApi as policyApi }                 from './baseApi/basePolicyApi'
import { baseServiceApi as serviceApi }               from './baseApi/baseServiceApi'
import { baseSwitchApi as switchApi }                 from './baseApi/baseSwitchApi'
import { baseTimelineApi as timelineApi }             from './baseApi/baseTimelineApi'
import { baseVenueApi as venueApi }                   from './baseApi/baseVenueApi'
import { dataApi }                                    from './baseApi/dataApi'
import { networkHealthApi }                           from './baseApi/networkHealthApi'

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

export const userApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  tagTypes: ['UserProfile', 'Mfa'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

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
