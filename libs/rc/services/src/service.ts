import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import _                from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult,
  Service,
  CommonResult,
  MdnsProxyFormData,
  MdnsProxyUrls,
  DHCPSaveData,
  DHCPDetailInstances,
  WifiCallingUrls,
  WifiUrlsInfo,
  MdnsProxyForwardingRule,
  WifiCallingFormContextType,
  WifiCallingSetting,
  DpskSaveData,
  DpskUrls,
  PortalDetailInstances,
  Portal,
  PortalUrlsInfo,
  DpskList,
  onSocketActivityChanged,
  showActivityMessage
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

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

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
      },
      providesTags: [{ type: 'Service', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            showActivityMessage(msg, [
              'AddL2AclPolicy'
            ],() => {
              api.dispatch(serviceApi.util.invalidateTags([{ type: 'Service', id: 'LIST' }]))
            }, params.requestId as string)
          }
        })
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
    getDHCPProfileList: build.query<DHCPSaveData[] | null, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getDHCPProfiles, params)
        return{
          ...req
        }
      }
    }),
    getDHCPProfile: build.query<DHCPSaveData | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetch) {
        if (!params?.serviceId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const result = await fetch(createHttpRequest(CommonUrlsInfo.getDHCPService, params))
        return result as QueryReturnValue<DHCPSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    getMdnsProxy: build.query<MdnsProxyFormData, RequestPayload>({
      query: ({ params, payload }) => {
        const mdnsProxyReq = createHttpRequest(MdnsProxyUrls.getMdnsProxy, params)
        return {
          ...mdnsProxyReq,
          body: payload
        }
      },
      transformResponse (result: MdnsProxyFormData) {
        if (!result.forwardingRules) {
          return result
        }

        result.forwardingRules = result.forwardingRules.map((rule: MdnsProxyForwardingRule) => {
          return {
            ...rule,
            id: uuidv4()
          }
        })
        return result
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    updateMdnsProxy: build.mutation<MdnsProxyFormData, RequestPayload<MdnsProxyFormData>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MdnsProxyUrls.updateMdnsProxy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    deleteMdnsProxy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MdnsProxyUrls.deleteMdnsProxy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    deleteMdnsProxyList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MdnsProxyUrls.deleteMdnsProxyList, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    addMdnsProxy: build.mutation<MdnsProxyFormData, RequestPayload<MdnsProxyFormData>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MdnsProxyUrls.addMdnsProxy, params)

        if (payload?.forwardingRules) {
          payload.forwardingRules = payload.forwardingRules.map(r => _.omit(r, 'id'))
        }

        return {
          ...req,
          body: payload
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
        const result = await fetch(createHttpRequest(CommonUrlsInfo.getDHCPService, params))
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
    getPortal: build.query<Portal | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetch) {
        if (!params?.serviceId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const result = await fetch(createHttpRequest(CommonUrlsInfo.getService, params))
        return result as QueryReturnValue<Portal,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    savePortal: build.mutation<Service, RequestPayload>({
      query: ({ params, payload }) => {
        const createPortalReq = createHttpRequest(
          PortalUrlsInfo.savePortal, params
        )
        return {
          ...createPortalReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    dhcpVenueInstances: build.query<TableResult<DHCPDetailInstances>, RequestPayload>({
      query: ({ params }) => {
        const instancesRes = createHttpRequest(CommonUrlsInfo.getDHCPVenueInstances, params)
        return {
          ...instancesRes
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getDHCPProfileDetail: build.query<DHCPSaveData | undefined, RequestPayload>({
      query: ({ params }) => {
        const dhcpDetailReq = createHttpRequest(CommonUrlsInfo.getDHCProfileDetail, params)
        return {
          ...dhcpDetailReq
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getWifiCallingService: build.query<WifiCallingFormContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const reqParams = { ...params }
        const wifiCallingServiceReq = createHttpRequest(
          WifiCallingUrls.getWifiCalling, reqParams, RKS_NEW_UI
        )
        return {
          ...wifiCallingServiceReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getWifiCallingServiceList: build.query<WifiCallingSetting[], RequestPayload>({
      query: ({ params }) => {
        const wifiCallingServiceListReq = createHttpRequest(
          WifiCallingUrls.getWifiCallingList, params, RKS_NEW_UI
        )
        return {
          ...wifiCallingServiceListReq
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'Add WiFi Calling Service Profile',
            'Update WiFi Calling Service Profile',
            'Delete WiFi Calling Service Profile',
            'Delete WiFi Calling Service Profiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([{ type: 'Service', id: 'LIST' }]))
          })
        })
      }
    }),
    createWifiCallingService: build.mutation<WifiCallingFormContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const createWifiCallingServiceReq = createHttpRequest(
          WifiCallingUrls.addWifiCalling, params, RKS_NEW_UI
        )
        return {
          ...createWifiCallingServiceReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    updateWifiCallingService: build.mutation<WifiCallingFormContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          WifiCallingUrls.updateWifiCalling, params, RKS_NEW_UI
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    createDpsk: build.mutation<DpskSaveData, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        const createDpskReq = createHttpRequest(DpskUrls.addDpsk, params)
        return {
          ...createDpskReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    updateDpsk: build.mutation<DpskSaveData, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        const updateDpskReq = createHttpRequest(DpskUrls.updateDpsk, params)
        return {
          ...updateDpskReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    dpskList: build.query<DpskList, RequestPayload>({
      query: () => {
        const getDpskListReq = createHttpRequest(DpskUrls.getDpskList)
        return {
          ...getDpskListReq
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getDpsk: build.query<DpskSaveData, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskReq = createHttpRequest(DpskUrls.getDpsk, params)
        return {
          ...getDpskReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    portalNetworkInstances: build.query<TableResult<PortalDetailInstances>, RequestPayload>({
      query: ({ params }) => {
        const instancesRes = createHttpRequest(PortalUrlsInfo.getPortalNetworkInstances, params)
        return {
          ...instancesRes
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getPortalProfileDetail: build.query<Portal | undefined, RequestPayload>({
      query: ({ params }) => {
        const portalDetailReq = createHttpRequest(PortalUrlsInfo.getPortalProfileDetail, params)
        return {
          ...portalDetailReq
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
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
  useGetDHCPProfileQuery,
  useSaveDHCPMutation,
  useDhcpVenueInstancesQuery,
  useGetDHCPProfileDetailQuery,
  useVlanPoolListQuery,
  useAccessControlProfileListQuery,
  useGetDHCPProfileListQuery,
  useGetMdnsProxyQuery,
  useAddMdnsProxyMutation,
  useUpdateMdnsProxyMutation,
  useDeleteMdnsProxyMutation,
  useDeleteMdnsProxyListMutation,
  useDeleteWifiCallingServiceMutation,
  useGetWifiCallingServiceQuery,
  useGetWifiCallingServiceListQuery,
  useCreateWifiCallingServiceMutation,
  useUpdateWifiCallingServiceMutation,
  useCreateDpskMutation,
  useUpdateDpskMutation,
  useGetDpskQuery,
  useLazyDpskListQuery,
  useGetPortalQuery,
  useSavePortalMutation,
  usePortalNetworkInstancesQuery,
  useGetPortalProfileDetailQuery
} = serviceApi
