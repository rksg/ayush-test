import { configureStore }                                 from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { dataApi }         from '@acx-ui/analytics/services'
import {
  baseNetworkApi as networkApi,
  baseVenueApi as venueApi,
  baseEventAlarmApi as eventAlarmApi,
  baseServiceApi as serviceApi,
  apApi,
  baseUserApi as userApi,
  baseDhcpApi as dhcpApi
} from '@acx-ui/rc/services'

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
    [serviceApi.reducerPath]: serviceApi.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      networkApi.middleware,
      venueApi.middleware,
      eventAlarmApi.middleware,
      dataApi.middleware,
      apApi.middleware,
      userApi.middleware,
      dataApi.middleware,
      dhcpApi.middleware,
      serviceApi.middleware
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
