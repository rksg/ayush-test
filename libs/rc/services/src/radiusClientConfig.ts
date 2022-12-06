import {
  createApi,
  fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  RequestPayload,
  createHttpRequest, RadiusClientConfigUrlsInfo
} from '@acx-ui/rc/utils'
import { ClientConfig } from '@acx-ui/rc/utils'

export const baseRadiusClientConfigApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'radiusClientConfigApi',
  tagTypes: ['RadiusClientConfig'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const radiusClientConfigApi = baseRadiusClientConfigApi.injectEndpoints({
  endpoints: (build) => ({
    UpdateRadiusClientConfig: build.mutation<ClientConfig, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RadiusClientConfigUrlsInfo.updateRadiusClient)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RadiusClientConfig', id: 'DETAIL' }]
    }),
    getRadiusClientConfig: build.query<ClientConfig, RequestPayload>({
      query: () => {
        const req = createHttpRequest(RadiusClientConfigUrlsInfo.getRadiusClient)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'RadiusClientConfig', id: 'DETAIL' }]
    })
  })
})

export const {
  useGetRadiusClientConfigQuery,
  useUpdateRadiusClientConfigMutation
} = radiusClientConfigApi
