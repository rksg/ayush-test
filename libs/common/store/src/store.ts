
import { configureStore }                                 from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import {
  baseNetworkApi as networkApi,
  baseCloudpathApi as cloudpathApi,
  baseEventAlarmApi as eventAlarmApi
} from '@acx-ui/rc/services'

export const store = configureStore({
  reducer: {
    [networkApi.reducerPath]: networkApi.reducer,
    [cloudpathApi.reducerPath]: cloudpathApi.reducer,
    [eventAlarmApi.reducerPath]: eventAlarmApi.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      networkApi.middleware,
      cloudpathApi.middleware,
      eventAlarmApi.middleware
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
