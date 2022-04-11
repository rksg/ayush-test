import { createApi, fetchBaseQuery }         from '@reduxjs/toolkit/query/react'
import { CommonUrlsInfo, createHttpRequest } from 'src/utils/rc'

export const networkListApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'networkListApi',
  tagTypes: ['Network'],
  endpoints: (build) => ({
    networkList: build.query<any, any>({
      query: (payload) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList)
        return {
          ...networkListReq,
          body: payload
        }
      },
      providesTags: ['Network']
    }),
    createNetwork: build.mutation<any, any>({
      query: (payload) => {
        const createNetworkReq = createHttpRequest(CommonUrlsInfo.addNetworkDeep)
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
  endpoints: (build) => ({
    venueList: build.query<any, any>({
      query: ({ networkId, payload }) => {
        const venueListReq = createHttpRequest(CommonUrlsInfo.getNetworksVenuesList, {
          networkId
        })
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
  endpoints: (build) => ({
    cloudpathList: build.query<any, any>({
      query: () => {
        const cloudpathListReq = createHttpRequest(CommonUrlsInfo.getCloudpathList)
        return{
          ...cloudpathListReq
        }
      }
    })
  })
})
export const { useCloudpathListQuery } = cloudpathListApi

