import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import _          from 'lodash'
import { Params } from 'react-router-dom'

import {
  CommonUrlsInfo,
  DHCPUrls,
  createHttpRequest,
  RequestPayload,
  TableResult,
  Service,
  CommonResult,
  MdnsProxyFormData,
  MdnsProxyUrls,
  DHCPSaveData,
  LeaseUnit,
  DHCPDetailInstances,
  WifiCallingUrls,
  WifiUrlsInfo,
  WifiCallingFormContextType,
  WifiCallingSetting,
  DpskSaveData,
  DpskUrls,
  PortalDetailInstances,
  Portal,
  PortalUrlsInfo,
  NewTableResult,
  NewDpskPassphrase,
  transferTableResult,
  DpskPassphrasesSaveData,
  convertMdnsProxyFormDataToApiPayload,
  MdnsProxyGetApiResponse,
  convertApiPayloadToMdnsProxyFormData,
  onSocketActivityChanged,
  showActivityMessage,
  MdnsProxyAp,
  UploadUrlResponse
} from '@acx-ui/rc/utils'
import {
  CloudpathServer,
  DevicePolicy,
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
  tagTypes: ['Service', 'Dpsk', 'DpskPassphrase', 'MdnsProxy', 'MdnsProxyAp'],
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
      providesTags: [{ type: 'Service', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'Add Multicast DNS Proxy Service Profile',
            'Update Multicast DNS Proxy Service Profile',
            'Delete Multicast DNS Proxy Service Profile',
            'Delete Multicast DNS Proxy Service Profiles',
            'Activate Multicast DNS Proxy Service Profiles',
            'Deactivate Multicast DNS Proxy Service Profiles',
            'Delete WiFi Calling Service Profile',
            'Delete WiFi Calling Service Profiles',
            'Update Portal Service Profile',
            'Delete Portal Service Profile',
            'Delete Portal Service Profiles',
            'Delete DHCP Config Service Profile',
            'Delete DHCP Config Service Profiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
          })
        })
      }
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
    getDHCPProfileList: build.query<DHCPSaveData[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.getDHCPProfiles, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Service', id: 'DHCP' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'AddDhcpConfigServiceProfile',
            'UpdateDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'Service', id: 'DHCP' }
            ]))
          })
        })
      }
    }),
    getDHCPProfile: build.query<DHCPSaveData | null, RequestPayload>({
      query: ({ params }) => {
        const dhcpDetailReq = createHttpRequest(DHCPUrls.getDHCProfileDetail, params)
        return {
          ...dhcpDetailReq
        }
      },
      transformResponse (dhcpProfile: DHCPSaveData) {
        _.each(dhcpProfile.dhcpPools, (pool)=>{
          if(pool.leaseTimeHours && pool.leaseTimeHours > 0){
            pool.leaseUnit = LeaseUnit.HOURS
            pool.leaseTime = pool.leaseTimeHours
          }
          if(pool.leaseTimeMinutes && pool.leaseTimeMinutes > 0){
            pool.leaseUnit = LeaseUnit.MINUTES
            pool.leaseTime = pool.leaseTimeMinutes
          }

        })
        return dhcpProfile
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    saveOrUpdateDHCP: build.mutation<DHCPSaveData, RequestPayload>({
      query: ({ params, payload }:{ params:Params, payload:DHCPSaveData }) => {
        let dhcpReq
        if(_.isEmpty(params.serviceId)){
          dhcpReq = createHttpRequest(DHCPUrls.addDHCPService, params, RKS_NEW_UI)
        }else{
          dhcpReq = createHttpRequest(DHCPUrls.updateDHCPService, params, RKS_NEW_UI)
        }
        return {
          ...dhcpReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    deleteDHCPService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.deleteDHCPProfile, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getMdnsProxy: build.query<MdnsProxyFormData, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MdnsProxyUrls.getMdnsProxy, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (response: MdnsProxyGetApiResponse) {
        return convertApiPayloadToMdnsProxyFormData(response)
      },
      providesTags: [{ type: 'MdnsProxy', id: 'DETAIL' }]
    }),
    getMdnsProxyList: build.query<MdnsProxyFormData[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MdnsProxyUrls.getMdnsProxyList, params)
        return {
          ...req
        }
      },
      transformResponse (response: MdnsProxyGetApiResponse[]) {
        return response.map(result => convertApiPayloadToMdnsProxyFormData(result))
      },
      providesTags: [{ type: 'MdnsProxy', id: 'LIST' }, { type: 'Service', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'Add Multicast DNS Proxy Service Profile',
            'Update Multicast DNS Proxy Service Profile',
            'Delete Multicast DNS Proxy Service Profile',
            'Delete Multicast DNS Proxy Service Profiles',
            'Activate Multicast DNS Proxy Service Profiles',
            'Deactivate Multicast DNS Proxy Service Profiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'MdnsProxy', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    updateMdnsProxy: build.mutation<MdnsProxyFormData, RequestPayload<MdnsProxyFormData>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MdnsProxyUrls.updateMdnsProxy, params)
        const convertedPayload = convertMdnsProxyFormDataToApiPayload(payload as MdnsProxyFormData)
        return {
          ...req,
          body: convertedPayload
        }
      },
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }]
    }),
    deleteMdnsProxy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MdnsProxyUrls.deleteMdnsProxy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }]
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
        const convertedPayload = convertMdnsProxyFormDataToApiPayload(payload as MdnsProxyFormData)

        return {
          ...req,
          body: convertedPayload
        }
      },
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }]
    }),
    addMdnsProxyAps: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MdnsProxyUrls.addMdnsProxyAps, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MdnsProxyAp', id: 'LIST' }]
    }),
    deleteMdnsProxyAps: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MdnsProxyUrls.deleteMdnsProxyAps, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MdnsProxyAp', id: 'LIST' }]
    }),
    getMdnsProxyAps: build.query<TableResult<MdnsProxyAp>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MdnsProxyUrls.getMdnsProxyApsByVenue, params)
        return {
          ...req
        }
      },
      transformResponse (response: MdnsProxyAp[]) {
        return {
          data: response,
          page: 0,
          totalCount: response.length
        }
      },
      providesTags: [{ type: 'MdnsProxyAp', id: 'LIST' }]
    }),
    getPortal: build.query<Portal | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetch) {
        if (!params?.serviceId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const result = await fetch(createHttpRequest(PortalUrlsInfo.getPortal, params))
        return result as QueryReturnValue<Portal,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    deletePortal: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PortalUrlsInfo.deletePortal, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    updatePortal: build.mutation<Service, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PortalUrlsInfo.updatePortal, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    savePortal: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
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
      query: ({ payload }) => {
        const createDpskReq = createHttpRequest(DpskUrls.addDpsk)
        return {
          ...createDpskReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'Dpsk', id: 'LIST' }]
    }),
    updateDpsk: build.mutation<DpskSaveData, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        const updateDpskReq = createHttpRequest(DpskUrls.updateDpsk, params)
        return {
          ...updateDpskReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'Dpsk', id: 'LIST' }]
    }),
    dpskList: build.query<NewTableResult<DpskSaveData>, RequestPayload>({
      query: () => {
        const getDpskListReq = createHttpRequest(DpskUrls.getDpskList)
        return {
          ...getDpskListReq
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'Dpsk', id: 'LIST' }]
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
    createDpskPassphrases: build.mutation<CommonResult, RequestPayload<DpskPassphrasesSaveData>>({
      query: ({ params, payload }) => {
        const createDpskPassphrasesReq = createHttpRequest(DpskUrls.addPassphrase, params)
        return {
          ...createDpskPassphrasesReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    dpskPassphraseList: build.query<TableResult<NewDpskPassphrase>, RequestPayload>({
      query: ({ params }) => {
        const getDpskPassphraseListReq = createHttpRequest(DpskUrls.getPassphraseList, params)
        return {
          ...getDpskPassphraseListReq
        }
      },
      transformResponse (result: NewTableResult<NewDpskPassphrase>) {
        return transferTableResult<NewDpskPassphrase>(result)
      },
      providesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    deleteDpskPassphraseList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DpskUrls.deletePassphrase, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
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
    }),
    getPortalProfileList: build.query<{ content: Portal[] }, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PortalUrlsInfo.getPortalProfileList, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'Add Portal Service Profile',
            'Update Portal Service Profile',
            'Delete Portal Service Profile',
            'Delete Portal Service Profiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([{ type: 'Service', id: 'LIST' }]))
          })
        })
      }
    }),
    getPortalLang: build.mutation<{ [key: string]: string }, RequestPayload>({
      query: ({ params }) => {
        const portalLang = createHttpRequest(PortalUrlsInfo.getPortalLang, params)
        return {
          ...portalLang
        }
      }
    }),
    uploadURL: build.mutation<UploadUrlResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const createUploadReq = createHttpRequest(CommonUrlsInfo.getUploadURL, params, RKS_NEW_UI)
        return {
          ...createUploadReq,
          body: payload
        }
      }
    })
  })
})


export const {
  useCloudpathListQuery,
  useApplicationPolicyListQuery,
  useDevicePolicyListQuery,
  useServiceListQuery,
  useGetDHCPProfileQuery,
  useSaveOrUpdateDHCPMutation,
  useDeleteDHCPServiceMutation,
  useDhcpVenueInstancesQuery,
  useVlanPoolListQuery,
  useAccessControlProfileListQuery,
  useGetDHCPProfileListQuery,
  useLazyGetDHCPProfileListQuery,
  useGetMdnsProxyQuery,
  useLazyGetMdnsProxyListQuery,
  useGetMdnsProxyListQuery,
  useAddMdnsProxyMutation,
  useUpdateMdnsProxyMutation,
  useDeleteMdnsProxyMutation,
  useDeleteMdnsProxyListMutation,
  useAddMdnsProxyApsMutation,
  useDeleteMdnsProxyApsMutation,
  useGetMdnsProxyApsQuery,
  useDeleteWifiCallingServiceMutation,
  useGetWifiCallingServiceQuery,
  useGetWifiCallingServiceListQuery,
  useCreateWifiCallingServiceMutation,
  useUpdateWifiCallingServiceMutation,
  useCreateDpskMutation,
  useUpdateDpskMutation,
  useGetDpskQuery,
  useDpskListQuery,
  useLazyDpskListQuery,
  useDpskPassphraseListQuery,
  useCreateDpskPassphrasesMutation,
  useDeleteDpskPassphraseListMutation,
  useGetPortalQuery,
  useSavePortalMutation,
  usePortalNetworkInstancesQuery,
  useGetPortalProfileDetailQuery,
  useLazyGetPortalProfileListQuery,
  useGetPortalProfileListQuery,
  useGetPortalLangMutation,
  useDeletePortalMutation,
  useUpdatePortalMutation,
  useUploadURLMutation
} = serviceApi
