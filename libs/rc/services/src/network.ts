import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { message }                   from 'antd'

import {
  CommonUrlsInfo,
  createHttpRequest,
  GuestNetworkTypeEnum,
  onSocketActivityChanged,
  RequestPayload,
  TableResult,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

export interface Network {
  id: string
  name: string
  description: string
  nwSubType: string
  ssid: string
  vlan: number
  aps: number
  clients: number
  venues: { count: number, names: string[] }
  captiveType: GuestNetworkTypeEnum
  deepNetwork?: {
    wlan: {
      wlanSecurity: WlanSecurityEnum
    }
  }
  vlanPool?: { name: string }
  // cog ??
}

export interface Venue {
  id: string
  name: string
  description: string
  status: string
  city: string
  country: string
  latitude: string
  longitude: string
  mesh: { enabled: boolean }
  aggregatedApStatus: { [statusKey: string]: number }
  networks: {
    count: number
    names: string[]
    vlans: number[]
  }
  // aps ??
  // switches ??
  // switchClients ??
  // radios ??
  // scheduling ??
  activated: { isActivated: boolean }
}

export const networkListApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'networkListApi',
  tagTypes: ['Network'],
  endpoints: (build) => ({
    networkList: build.query<TableResult<Network>, RequestPayload>({
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
  endpoints: (build) => ({
    venueList: build.query<TableResult<Venue>, RequestPayload>({
      query: ({ params, payload }) => {
        const venueListReq = createHttpRequest(CommonUrlsInfo.getNetworksVenuesList, params)
        return{
          ...venueListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<Venue>) {
        result.data = result.data.map(item => ({
          ...item,
          activated: item.activated ?? { isActivated: false }
        }))
        return result
      }
    })
  })
})
export const { useVenueListQuery } = venueListApi


export const cloudpathListApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'cloudpathListApi',
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

export const dashboardOverviewApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'dashboardOverviewApi',
  endpoints: (build) => ({
    dashboardOverview: build.query<any, any>({
      query: ({ params }) => {
        const dashboardOverviewReq = createHttpRequest(CommonUrlsInfo.getDashboardOverview, params)
        return{
          ...dashboardOverviewReq
        }
      }
    })
  })
})
export const { useDashboardOverviewQuery } = dashboardOverviewApi
