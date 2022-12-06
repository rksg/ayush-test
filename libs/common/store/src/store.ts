import { configureStore, isRejectedWithValue }            from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { generatePath }                                   from 'react-router-dom'

import { dataApi }             from '@acx-ui/analytics/services'
import {
  baseNetworkApi as networkApi,
  baseVenueApi as venueApi,
  baseEventAlarmApi as eventAlarmApi,
  baseServiceApi as serviceApi,
  apApi,
  baseUserApi as userApi,
  baseDhcpApi as dhcpApi,
  baseMspApi as mspApi,
  baseEdgeApi as edgeApi,
  basePolicyApi as policyApi
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
      window.location.href = generatePath('/logout')
    }
  }
  return next(action)
}

export const store = configureStore({
  reducer: {
    [networkApi.reducerPath]: networkApi.reducer,
    [venueApi.reducerPath]: venueApi.reducer,
    [eventAlarmApi.reducerPath]: eventAlarmApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
    [apApi.reducerPath]: apApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
    [dhcpApi.reducerPath]: dhcpApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [mspApi.reducerPath]: mspApi.reducer,
    [edgeApi.reducerPath]: edgeApi.reducer,
    [policyApi.reducerPath]: policyApi.reducer
  },

  middleware: (getDefaultMiddleware) => {
    const isDev = process.env['NODE_ENV'] === 'development'
    return getDefaultMiddleware({
      serializableCheck: isDev ? undefined : false,
      immutableCheck: isDev ? undefined : false
    }).concat([
      ...(isDev ? [] : [errorMiddleware]),
      networkApi.middleware,
      venueApi.middleware,
      eventAlarmApi.middleware,
      dataApi.middleware,
      apApi.middleware,
      userApi.middleware,
      dataApi.middleware,
      dhcpApi.middleware,
      serviceApi.middleware,
      mspApi.middleware,
      edgeApi.middleware,
      policyApi.middleware
    ])
  },

  devTools: process.env['NODE_ENV'] !== 'production'
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function baseSelector (state: AppState) {
  return state
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
