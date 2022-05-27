
import { configureStore }                                 from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import {
  networkListApi,
  venueListApi,
  cloudpathListApi,
  dashboardOverviewApi,
  alarmsListApi
} from '@acx-ui/rc/services'

export const store = configureStore({
  reducer: {
    [networkListApi.reducerPath]: networkListApi.reducer,
    [venueListApi.reducerPath]: venueListApi.reducer,
    [cloudpathListApi.reducerPath]: cloudpathListApi.reducer,
    [dashboardOverviewApi.reducerPath]: dashboardOverviewApi.reducer,
    [alarmsListApi.reducerPath]: alarmsListApi.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      networkListApi.middleware,
      venueListApi.middleware,
      cloudpathListApi.middleware,
      dashboardOverviewApi.middleware,
      alarmsListApi.middleware
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
