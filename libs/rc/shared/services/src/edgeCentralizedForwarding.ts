import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/react'

import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  NewAPITableResult,
  transferNewResToTableResult,
  EdgeCentralizedForwardingUrls as CFUrls,
  EdgeCentralizedForwardingSetting,
  EdgeCentralizedForwardingViewData,
  EdgeUrlsInfo,
  EdgeStatus
} from '@acx-ui/rc/utils'
import { baseEdgeCentralizedForwardingApi } from '@acx-ui/store'
import { RequestPayload }                   from '@acx-ui/types'
import { createHttpRequest }                from '@acx-ui/utils'

import { serviceApi } from './service'

export const edgeCentralizedForwardingApi = baseEdgeCentralizedForwardingApi.injectEndpoints({
  endpoints: (build) => ({
    getEdgeCentralizedForwardingList:
      build.query<TableResult<EdgeCentralizedForwardingSetting>, RequestPayload>({
        query: ({ params }) => {
          const req = createHttpRequest(CFUrls.getEdgeCentralizedForwardingList, params)
          return {
            ...req
          }
        },
        providesTags: [{ type: 'EdgeCentralizedForwarding', id: 'LIST' }],
        transformResponse: (result: NewAPITableResult<EdgeCentralizedForwardingSetting>) => {
          return transferNewResToTableResult<EdgeCentralizedForwardingSetting>(result)
        },
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            onActivityMessageReceived(msg, [
              'Add CentralizedForwarding',
              'Update CentralizedForwarding',
              'Delete CentralizedForwarding'
            ], () => {
              api.dispatch(serviceApi.util.invalidateTags([
                { type: 'Service', id: 'LIST' }
              ]))
              api.dispatch(edgeCentralizedForwardingApi.util.invalidateTags([
                { type: 'EdgeCentralizedForwarding', id: 'LIST' }
              ]))
            })
          })
        }
      }),
    getEdgeCentralizedForwarding: build.query<EdgeCentralizedForwardingSetting, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const cfRequest = createHttpRequest(
          CFUrls.getEdgeCentralizedForwarding, arg.params)
        const cfQuery = await fetchWithBQ(cfRequest)
        const cfConfig = cfQuery.data as EdgeCentralizedForwardingSetting

        const edgeRequest = createHttpRequest(EdgeUrlsInfo.getEdgeList)
        const edgeQuery = await fetchWithBQ({
          ...edgeRequest,
          body: {
            fields: [
              'name',
              'serialNumber',
              'venueId',
              'venueName'
            ],
            filters: {
              serialNumber: [cfConfig.edgeId]
            }
          }
        })

        const edgeInfo = edgeQuery.data as TableResult<EdgeStatus>
        cfConfig.venueId = edgeInfo.data[0].venueId

        return cfQuery.data
          ? { data: cfConfig }
          : { error: cfQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'EdgeCentralizedForwarding', id: 'DETAIL' }]
    }),
    addEdgeCentralizedForwarding: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CFUrls.addEdgeCentralizedForwarding, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeCentralizedForwarding', id: 'LIST' }]
    }),
    updateEdgeCentralizedForwarding: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CFUrls.updateEdgeCentralizedForwarding, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeCentralizedForwarding', id: 'LIST' }]
    }),
    updateEdgeCentralizedForwardingPartial: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CFUrls.updateEdgeCentralizedForwardingPartial, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeCentralizedForwarding', id: 'LIST' }]
    }),
    getEdgeCentralizedForwardingViewDataList:
      build.query<TableResult<EdgeCentralizedForwardingViewData>, RequestPayload>({
        query: ({ payload }) => {
          const req = createHttpRequest(CFUrls.getEdgeCentralizedForwardingViewDataList)
          return {
            ...req,
            body: payload
          }
        },
        providesTags: [{ type: 'EdgeCentralizedForwarding', id: 'LIST' }],
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            onActivityMessageReceived(msg, [
              'Add CentralizedForwarding',
              'Update CentralizedForwarding',
              'Delete CentralizedForwarding'
            ], () => {
              api.dispatch(serviceApi.util.invalidateTags([
                { type: 'Service', id: 'LIST' }
              ]))
              api.dispatch(edgeCentralizedForwardingApi.util.invalidateTags([
                { type: 'EdgeCentralizedForwarding', id: 'LIST' }
              ]))
            })
          })
        },
        extraOptions: { maxRetries: 5 }
      }),
    deleteEdgeCentralizedForwarding: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload) { //delete multiple rows
          const req = createHttpRequest(CFUrls.batchDeleteEdgeCentralizedForwarding)
          return {
            ...req,
            body: payload
          }
        } else { //delete single row
          const req = createHttpRequest(CFUrls.deleteEdgeCentralizedForwarding, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'EdgeCentralizedForwarding', id: 'LIST' }]
    })
  })
})

export const {
  useGetEdgeCentralizedForwardingListQuery,
  useGetEdgeCentralizedForwardingQuery,
  useGetEdgeCentralizedForwardingViewDataListQuery,
  useAddEdgeCentralizedForwardingMutation,
  useUpdateEdgeCentralizedForwardingMutation,
  useUpdateEdgeCentralizedForwardingPartialMutation,
  useDeleteEdgeCentralizedForwardingMutation
} = edgeCentralizedForwardingApi
