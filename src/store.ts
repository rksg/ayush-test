import { configureStore }                                 from '@reduxjs/toolkit'
import { networkListApi, venueListApi, cloudpathListApi } from './App/Networks/services'

export const store = configureStore({
  reducer: {
    [networkListApi.reducerPath]: networkListApi.reducer,
    [venueListApi.reducerPath]: venueListApi.reducer,
    [cloudpathListApi.reducerPath]: cloudpathListApi.reducer
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat([
      networkListApi.middleware,
      venueListApi.middleware,
      cloudpathListApi.middleware
    ]),

  devTools: process.env.NODE_ENV !== 'production'
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function baseSelector (state: AppState) { return state }
