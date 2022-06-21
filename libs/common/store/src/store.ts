
import { configureStore }                                 from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { dataApi }         from '@acx-ui/analytics/services'
import {
  baseNetworkApi as networkApi,
  baseCloudpathApi as cloudpathApi,
  baseEventAlarmApi as eventAlarmApi,
  apApi,
  baseUserApi as userApi
} from '@acx-ui/rc/services'

export const store = configureStore({
  reducer: {
    [networkApi.reducerPath]: networkApi.reducer,
    [cloudpathApi.reducerPath]: cloudpathApi.reducer,
    [eventAlarmApi.reducerPath]: eventAlarmApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
    [apApi.reducerPath]: apApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      networkApi.middleware,
      cloudpathApi.middleware,
      eventAlarmApi.middleware,
      dataApi.middleware,
      apApi.middleware,
      userApi.middleware,
      dataApi.middleware
    ]),

  devTools: process.env['NODE_ENV'] !== 'production'
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function baseSelector (state: AppState) {
  return state
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
