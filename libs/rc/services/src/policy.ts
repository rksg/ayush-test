import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  Policy,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'


export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  tagTypes: ['Policy'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const policyApi = basePolicyApi.injectEndpoints({
  endpoints: (build) => ({
    policyList: build.query<TableResult<Policy>, RequestPayload>({
      query: ({ params, payload }) => {
        const policyListReq = createHttpRequest(CommonUrlsInfo.getPoliciesList, params)
        return {
          ...policyListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    })
  })
})


export const {
  usePolicyListQuery
} = policyApi
