import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { message }                   from 'antd'

import { CommonUrlsInfo, createHttpRequest, onSocketActivityChanged } from '@acx-ui/rc/utils'
import { Params }                                                     from '@acx-ui/react-router-dom'

interface RequestPayload {
  params?: Params<string>
  payload?: any
}

export const networkListApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'networkListApi',
  tagTypes: ['Network'],
  refetchOnMountOrArgChange: true,
  endpoints: (build) => ({
    networkList: build.query<any, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        return {
          ...networkListReq,
          body: payload
        }
      },
      providesTags: ['Network'],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if (msg.status !== 'SUCCESS') return
          if (!['DeleteNetwork', 'AddNetworkDeep'].includes(msg.useCase)) return

          if (msg.useCase === 'AddNetworkDeep') message.success('Created successfully')

          api.dispatch(networkListApi.util.invalidateTags(['Network']))
        })
      }
    }),
    createNetwork: build.mutation<any, RequestPayload>({
      query: ({ params, payload }) => {
        const createNetworkReq = createHttpRequest(CommonUrlsInfo.addNetworkDeep, params)
        return {
          ...createNetworkReq,
          body: payload
        }
      },
      invalidatesTags: ['Network']
    })
  })
})
export const {
  useNetworkListQuery,
  useCreateNetworkMutation
} = networkListApi

export const venueListApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'venueListApi',
  refetchOnMountOrArgChange: true,
  endpoints: (build) => ({
    venueList: build.query<any, RequestPayload>({
      query: ({ params, payload }) => {
        const venueListReq = createHttpRequest(CommonUrlsInfo.getNetworksVenuesList, params)
        return{
          ...venueListReq,
          body: payload
        }
      }
    })
  })
})
export const { useVenueListQuery } = venueListApi


export const cloudpathListApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'cloudpathListApi',
  refetchOnMountOrArgChange: true,
  endpoints: (build) => ({
    cloudpathList: build.query<any, RequestPayload>({
      query: ({ params }) => {
        const cloudpathListReq = createHttpRequest(CommonUrlsInfo.getCloudpathList, params)
        return{
          ...cloudpathListReq
        }
      }
    })
  })
})
export const { useCloudpathListQuery } = cloudpathListApi
