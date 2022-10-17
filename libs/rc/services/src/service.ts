import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult,
  Service,
  CommonResult,
  DHCPSaveData,
  WifiCallingUrls,
  WifiUrlsInfo,
  Portal
} from '@acx-ui/rc/utils'
import {
  CloudpathServer,
  L2AclPolicy,
  DevicePolicy,
  L3AclPolicy,
  ApplicationPolicy,
  VlanPool,
  AccessControlProfile
} from '@acx-ui/rc/utils'



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
    accessControlProfileList: build.query<AccessControlProfile[], RequestPayload>({
      query: ({ params }) => {
        const accessControlProfileListReq = createHttpRequest(
          CommonUrlsInfo.getAccessControlProfileList,
          params
        )
        return {
          ...accessControlProfileListReq
        }
      }
    }),
    vlanPoolList: build.query<VlanPool[], RequestPayload>({
      query: ({ params }) => {
        const vlanPoolListReq = createHttpRequest(
          WifiUrlsInfo.getVlanPools,
          params
        )
        return {
          ...vlanPoolListReq
        }
      }
    }),
    deleteWifiCallingService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiCallingUrls.deleteWifiCalling, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getDHCP: build.query<DHCPSaveData | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetch) {
        if (!params?.serviceId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const result = await fetch(createHttpRequest(CommonUrlsInfo.getService, params))
        return result as QueryReturnValue<DHCPSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    saveDHCP: build.mutation<Service, RequestPayload>({
      query: ({ params, payload }) => {

        const createDHCPReq = createHttpRequest(CommonUrlsInfo.saveDHCPService, params)
        return {
          ...createDHCPReq,
          body: payload
        }

      },

      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getPortalService: build.query<TableResult<Portal>, RequestPayload>({
      query: ({ params, payload }) => {
        const wifiCallingServiceReq = createHttpRequest(
          CommonUrlsInfo.getWifiCallingService, params
        )
        return {
          ...wifiCallingServiceReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    createPortalService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const createWifiCallingServiceReq = createHttpRequest(
          CommonUrlsInfo.addWifiCallingService, params
        )
        return {
          ...createWifiCallingServiceReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    updatePortalService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          CommonUrlsInfo.updateWifiCallingService, params
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    deletePortalService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteWifiCallingService, params)
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
  useGetDHCPQuery,
  useSaveDHCPMutation,
  useVlanPoolListQuery,
  useAccessControlProfileListQuery,
  useDeleteWifiCallingServiceMutation,
  useCreatePortalServiceMutation
} = serviceApi
