import { configureStore }                           from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery }                from '@reduxjs/toolkit/query/react'
import { Provider as ReduxProvider, ProviderProps } from 'react-redux'

import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { TableResult } from '..'
// import { createHttpRequest }           from '../../apiService'

interface TestData { name: string }

export const testUrl = { method: 'post', url: '/test' }

const baseTestApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'testApi',
  tagTypes: ['Ap'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})

const testApi = baseTestApi.injectEndpoints({
  endpoints: (build) => ({
    test: build.query<TableResult<TestData>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(testUrl, params)
        return { ...req, body: payload }
      },
      transformResponse (result: TableResult<TestData>) {
        return result
      }
    })
  })
})

export const { useTestQuery } = testApi

const store = configureStore({
  reducer: { [baseTestApi.reducerPath]: baseTestApi.reducer },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    }).concat([ baseTestApi.middleware ])
  }
})

export function Provider (props: Omit<ProviderProps, 'store'>) {
  return <ReduxProvider {...props} store={store} />
}
