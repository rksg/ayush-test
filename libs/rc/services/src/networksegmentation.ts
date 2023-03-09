/* eslint-disable max-len */
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import {
  AccessSwitch,
  CommonResult,
  createHttpRequest,
  DistributionSwitch,
  NetworkSegmentationGroup,
  NetworkSegmentationGroupStats,
  NetworkSegmentationUrls,
  NewTableResult,
  RequestPayload,
  SwitchLite,
  TableResult,
  transferToTableResult,
  WebAuthTemplate
} from '@acx-ui/rc/utils'

export const baseNsgApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'nsgApi',
  tagTypes: ['Networksegmentation', 'WebAuthNSG'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const nsgApi = baseNsgApi.injectEndpoints({
  endpoints: (build) => ({
    createNetworkSegmentationGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.createNetworkSegmentationGroup)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    }),
    getNetworkSegmentationStatsList: build.query<TableResult<NetworkSegmentationGroupStats>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.getNetworkSegmentationStatsList)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    }),
    deleteNetworkSegmentationGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.deleteNetworkSegmentationGroup, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    }),
    updateNetworkSegmentationGroup: build.mutation<NetworkSegmentationGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          NetworkSegmentationUrls.updateNetworkSegmentationGroup,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    }),
    getNetworkSegmentationGroupById: build.query<NetworkSegmentationGroup, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const nsgRequest = createHttpRequest(
          NetworkSegmentationUrls.getNetworkSegmentationGroupById, arg.params)
        const nsgQuery = await fetchWithBQ(nsgRequest)
        const nsg = nsgQuery.data as NetworkSegmentationGroup

        const nsgSwitchRequest = createHttpRequest(
          NetworkSegmentationUrls.getSwitchInfoByNSGId, {
            ...arg.params,
            venueId: nsg.venueInfos[0].venueId
          })
        const nsgSwitchQuery = await fetchWithBQ(nsgSwitchRequest)
        const nsgSwitch = nsgSwitchQuery.data as {
          distributionSwitches: DistributionSwitch[]
          accessSwitches: AccessSwitch[]
        }

        const aggregatedData = aggregatedNSGData(nsg, nsgSwitch)

        return nsgQuery.data
          ? { data: aggregatedData }
          : { error: nsgQuery.error as FetchBaseQueryError }
      }
    }),
    // eslint-disable-next-line max-len
    getNetworkSegmentationGroupList: build.query<TableResult<NetworkSegmentationGroup>, RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(NetworkSegmentationUrls.getNetworkSegmentationGroupList, params)
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<NetworkSegmentationGroup>) {
        return transferToTableResult<NetworkSegmentationGroup>(result)
      }
    }),

    getWebAuthTemplate: build.query<WebAuthTemplate, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.getWebAuthTemplate, params)
        return {
          ...req
        }
      }
    }),
    webAuthTemplateList: build.query<TableResult<WebAuthTemplate>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.getWebAuthTemplateList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'WebAuthNSG', id: 'LIST' }]
    }),
    createWebAuthTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.addWebAuthTemplate, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'WebAuthNSG', id: 'LIST' }]
    }),
    updateWebAuthTemplate: build.mutation<WebAuthTemplate, RequestPayload<WebAuthTemplate>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.updateWebAuthTemplate, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'WebAuthNSG', id: 'LIST' }]
    }),
    deleteWebAuthTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.deleteWebAuthTemplate, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'WebAuthNSG', id: 'LIST' }]
    }),
    getAccessSwitchesByDS: build.query<{
      switchViewList: SwitchLite[]
    }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.getAccessSwitchesByDS, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getAvailableSwitches: build.query<{
      switchViewList: SwitchLite[]
    }, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.getAvailableSwitches, params)
        return {
          ...req
        }
      }
    }),
    validateDistributionSwitchInfo: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.validateDistributionSwitchInfo,params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    validateAccessSwitchInfo: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.validateAccessSwitchInfo, params)
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

const aggregatedNSGData = (
  nsg: NetworkSegmentationGroup,
  nsgSwitch: {
    distributionSwitches: DistributionSwitch[]
    accessSwitches: AccessSwitch[]
  }
) => {
  let distributionSwitchInfos: DistributionSwitch[]
  let accessSwitchInfos: AccessSwitch[]
  let dsMap: { [key: string]: AccessSwitch[] } = {}

  accessSwitchInfos = nsg.accessSwitchInfos?.map(as=>{
    const asDetail = nsgSwitch.accessSwitches.find(item=>item.id === as.id)
    const dsId = asDetail!.distributionSwitchId
    const ret: AccessSwitch = { ...as, ...asDetail }
    if (!dsMap.hasOwnProperty(dsId)) {
      dsMap[dsId] = []
    }
    dsMap[dsId].push(ret)
    return ret
  }) || []
  distributionSwitchInfos = nsg.distributionSwitchInfos?.map(ds=>{
    const dsDetail = nsgSwitch.distributionSwitches.find(item=>item.id === ds.id)
    const ret: DistributionSwitch = { ...ds, ...dsDetail, accessSwitches: dsMap[ds.id] }
    return ret
  }) || []

  return { ...nsg, distributionSwitchInfos, accessSwitchInfos } as NetworkSegmentationGroup
}

export const {
  useCreateNetworkSegmentationGroupMutation,
  useGetNetworkSegmentationStatsListQuery,
  useDeleteNetworkSegmentationGroupMutation,
  useUpdateNetworkSegmentationGroupMutation,
  useLazyGetNetworkSegmentationGroupByIdQuery,
  useGetNetworkSegmentationGroupByIdQuery,
  useGetNetworkSegmentationGroupListQuery,
  useGetWebAuthTemplateQuery,
  useLazyGetWebAuthTemplateQuery,
  useWebAuthTemplateListQuery,
  useCreateWebAuthTemplateMutation,
  useUpdateWebAuthTemplateMutation,
  useDeleteWebAuthTemplateMutation,
  useGetAccessSwitchesByDSQuery,
  useGetAvailableSwitchesQuery,
  useValidateDistributionSwitchInfoMutation,
  useValidateAccessSwitchInfoMutation
} = nsgApi
