import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'

import { CommonResult, Service } from './types'
import {
  CloudpathServer,
  L2AclPolicy,
  DevicePolicy,
  L3AclPolicy,
  ApplicationPolicy,
  VlanPool
} from './types/service'



export const baseServiceApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'serviceApi',
  tagTypes: ['Service'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const serviceApi = baseServiceApi.injectEndpoints({
  endpoints: (build) => ({
    serviceList: build.query<TableResult<Service>, RequestPayload>({
      query: ({ params, payload }) => {
        const serviceListReq = createHttpRequest(CommonUrlsInfo.getServicesList, params)
        return {
          ...serviceListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    cloudpathList: build.query<CloudpathServer[], RequestPayload>({
      query: ({ params }) => {
        const cloudpathListReq = createHttpRequest(
          CommonUrlsInfo.getCloudpathList,
          params
        )
        return {
          ...cloudpathListReq
        }
      }
    }),
    l2AclPolicyList: build.query<TableResult<L2AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const l2AclPolicyListReq = createHttpRequest(
          CommonUrlsInfo.getL2AclPolicyList,
          params
        )
        return {
          ...l2AclPolicyListReq,
          body: payload
        }
      }
    }),
    l3AclPolicyList: build.query<TableResult<L3AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const l3AclPolicyListReq = createHttpRequest(
          CommonUrlsInfo.getL3AclPolicyList,
          params
        )
        return {
          ...l3AclPolicyListReq,
          body: payload
        }
      }
    }),


    devicePolicyList: build.query<TableResult<DevicePolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const devicePolicyListReq = createHttpRequest(
          CommonUrlsInfo.getDevicePolicyList,
          params
        )
        return {
          ...devicePolicyListReq,
          body: payload
        }
      }
    }),

    applicationPolicyList: build.query<TableResult<ApplicationPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const applicationPolicyListReq = createHttpRequest(
          CommonUrlsInfo.getApplicationPolicyList,
          params
        )
        return {
          ...applicationPolicyListReq,
          body: payload
        }
      }
    }),
    vlanPoolList: build.query<TableResult<VlanPool>, RequestPayload>({
      query: ({ params, payload }) => {
        const vlanPoolListReq = createHttpRequest(
          CommonUrlsInfo.getVlanPools,
          params
        )
        return {
          ...vlanPoolListReq,
          body: payload
        }
      }
    }),
    deleteService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteService, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    })
  })
})


export const {
  useCloudpathListQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useApplicationPolicyListQuery,
  useDevicePolicyListQuery,
  useServiceListQuery,
  useDeleteServiceMutation,
  useVlanPoolListQuery
} = serviceApi
