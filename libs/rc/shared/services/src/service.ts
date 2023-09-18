import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import {
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import _          from 'lodash'
import { Params } from 'react-router-dom'

import {
  CommonUrlsInfo,
  DHCPUrls,
  TableResult,
  Service,
  CommonResult,
  MdnsProxyFormData,
  MdnsProxyUrls,
  DHCPSaveData,
  LeaseUnit,
  WifiCallingUrls,
  WifiCallingFormContextType,
  WifiCallingSetting,
  DpskSaveData,
  DpskUrls,
  Portal,
  PortalUrlsInfo,
  NewTableResult,
  NewDpskPassphrase,
  transferToTableResult,
  DpskPassphrasesSaveData,
  convertMdnsProxyFormDataToApiPayload,
  MdnsProxyGetApiResponse,
  convertApiPayloadToMdnsProxyFormData,
  onSocketActivityChanged,
  onActivityMessageReceived,
  MdnsProxyAp,
  UploadUrlResponse,
  TableChangePayload,
  RequestFormData,
  createNewTableHttpRequest,
  downloadFile,
  NewAPITableResult,
  transferNewResToTableResult,
  MdnsProxyViewModel,
  PortalTablePayload,
  IpUtilsService,
  DpskPassphraseClient,
  DPSKDeviceInfo,
  AccessControlUrls,
  DpskMutationResult,
  DpskDownloadNewFlowPassphrasesPayload,
  convertDpskNewFlowUrl,
  DpskDownloadPassphrasesPayload,
  DpskPassphrasesClientPayload,
  DpskNewFlowPassphraseClient
} from '@acx-ui/rc/utils'
import {
  CloudpathServer,
  ApplicationPolicy,
  AccessControlProfile
} from '@acx-ui/rc/utils'
import { baseServiceApi }             from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'

const defaultNewTablePaginationParams: TableChangePayload = {
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10000
}

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

const mDnsProxyMutationUseCases = [
  'AddMulticastDnsProxyServiceProfile',
  'DeleteMulticastDnsProxyServiceProfile',
  'DeleteMulticastDnsProxyServiceProfiles',
  'UpdateMulticastDnsProxyServiceProfile',
  'ActivateMulticastDnsProxyServiceProfileAps',
  'DeactivateMulticastDnsProxyServiceProfileAps'
]

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
          onActivityMessageReceived(msg, [
            ...mDnsProxyMutationUseCases,
            'AddWifiCallingServiceProfile',
            'DeleteWiFiCallingProfile',
            'DeleteWiFiCallingProfiles',
            'Update Portal Service Profile',
            'Delete Portal Service Profile',
            'Delete Portal Service Profiles',
            'AddDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfiles'
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
    applicationPolicyList: build.query<ApplicationPolicy[], RequestPayload>({
      query: ({ params }) => {
        const applicationPolicyListReq = createHttpRequest(
          AccessControlUrls.getAppPolicyList,
          params
        )
        return {
          ...applicationPolicyListReq
        }
      }
    }),
    accessControlProfileList: build.query<AccessControlProfile[], RequestPayload>({
      query: ({ params }) => {
        const accessControlProfileListReq = createHttpRequest(
          AccessControlUrls.getAccessControlProfileList,
          params
        )
        return {
          ...accessControlProfileListReq
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
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }]
    }),
    deleteWifiCallingServices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiCallingUrls.deleteWifiCallingList, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }]
    }),
    getDHCPProfileList: build.query<DHCPSaveData[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.getDHCPProfiles,
          params)

        return {
          ...req
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'DHCP', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddDhcpConfigServiceProfile',
            'UpdateDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'DHCP', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getDHCPProfileListViewModel: build.query<TableResult<DHCPSaveData>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DHCPUrls.getDHCPProfilesViewModel, params)

        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'DHCP', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddDhcpConfigServiceProfile',
            'UpdateDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'DHCP', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
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
          if(pool.leaseTimeMinutes && pool.leaseTimeMinutes > 0){
            pool.leaseUnit = LeaseUnit.MINUTES
            pool.leaseTime = pool.leaseTimeMinutes + (pool.leaseTimeHours||0)*60
          }else{
            pool.leaseUnit = LeaseUnit.HOURS
            pool.leaseTime = pool.leaseTimeHours
          }

          // eslint-disable-next-line max-len
          pool.numberOfHosts = IpUtilsService.countIpRangeSize(pool.startIpAddress, pool.endIpAddress)
        })
        return dhcpProfile
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }, { type: 'DHCP', id: 'DETAIL' }]
    }),
    saveOrUpdateDHCP: build.mutation<DHCPSaveData, RequestPayload>({
      query: ({ params, payload }:{ params:Params, payload:DHCPSaveData }) => {
        let dhcpReq
        if(_.isEmpty(params.serviceId)){
          dhcpReq = createHttpRequest(DHCPUrls.addDHCPService, params)
        }else{
          dhcpReq = createHttpRequest(DHCPUrls.updateDHCPService, params)
        }
        return {
          ...dhcpReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'DHCP', id: 'LIST' }]
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
          onActivityMessageReceived(msg, mDnsProxyMutationUseCases, () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'MdnsProxy', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getEnhancedMdnsProxyList: build.query<TableResult<MdnsProxyViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MdnsProxyUrls.getEnhancedMdnsProxyList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'MdnsProxy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, mDnsProxyMutationUseCases, () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'MdnsProxy', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
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
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }, { type: 'Service', id: 'LIST' }]
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
      providesTags: [{ type: 'MdnsProxyAp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
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
    getWifiCallingService: build.query<WifiCallingFormContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const reqParams = { ...params }
        const wifiCallingServiceReq = createHttpRequest(
          WifiCallingUrls.getWifiCalling, reqParams
        )
        return {
          ...wifiCallingServiceReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }, { type: 'WifiCalling', id: 'DETAIL' }]
    }),
    getWifiCallingServiceList: build.query<WifiCallingSetting[], RequestPayload>({
      query: ({ params }) => {
        const wifiCallingServiceListReq = createHttpRequest(
          WifiCallingUrls.getWifiCallingList, params
        )
        return {
          ...wifiCallingServiceListReq
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddWifiCallingServiceProfile',
            'UpdateWifiCallingServiceProfile',
            'DeleteWifiCallingServiceProfile',
            'DeleteWifiCallingServiceProfiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'WifiCalling', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    // eslint-disable-next-line max-len
    getEnhancedWifiCallingServiceList: build.query<TableResult<WifiCallingSetting>, RequestPayload>({
      query: ({ params, payload }) => {
        const wifiCallingServiceListReq = createHttpRequest(
          WifiCallingUrls.getEnhancedWifiCallingList, params
        )
        return {
          ...wifiCallingServiceListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddWifiCallingServiceProfile',
            'UpdateWifiCallingServiceProfile',
            'DeleteWifiCallingServiceProfile',
            'DeleteWifiCallingServiceProfiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'WifiCalling', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    createWifiCallingService: build.mutation<WifiCallingFormContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const createWifiCallingServiceReq = createHttpRequest(
          WifiCallingUrls.addWifiCalling, params
        )
        return {
          ...createWifiCallingServiceReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }]
    }),
    updateWifiCallingService: build.mutation<WifiCallingFormContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          WifiCallingUrls.updateWifiCalling, params
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }]
    }),
    createDpsk: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        const createDpskReq = createDpskHttpRequest(DpskUrls.addDpsk, params)
        return {
          ...createDpskReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Dpsk', id: 'LIST' }]
    }),
    updateDpsk: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        const updateDpskReq = createDpskHttpRequest(DpskUrls.updateDpsk, params)
        return {
          ...updateDpskReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Dpsk', id: 'LIST' }]
    }),
    getDpskList: build.query<TableResult<DpskSaveData>, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskListReq = createNewTableHttpRequest({
          apiInfo: transferDpskNewConfigApiInfo(DpskUrls.getDpskList, params),
          params,
          payload: (payload as TableChangePayload) ?? defaultNewTablePaginationParams
        })

        return {
          ...getDpskListReq
        }
      },
      providesTags: [{ type: 'Dpsk', id: 'LIST' }],
      transformResponse (result: NewTableResult<DpskSaveData>) {
        return transferToTableResult<DpskSaveData>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UPDATE_DPSK_SERVICE',
            'DELETE_DPSK_SERVICE',
            'CREATE_DPSK_SERVICE'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Dpsk', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getEnhancedDpskList: build.query<TableResult<DpskSaveData>, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskListReq = createDpskHttpRequest(DpskUrls.getEnhancedDpskList, params)

        return {
          ...getDpskListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Dpsk', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UPDATE_DPSK_SERVICE',
            'DELETE_DPSK_SERVICE',
            'CREATE_DPSK_SERVICE'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Dpsk', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getDpsk: build.query<DpskSaveData, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskReq = createDpskHttpRequest(DpskUrls.getDpsk, params)
        return {
          ...getDpskReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Dpsk', id: 'DETAIL' }]
    }),
    deleteDpsk: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.deleteDpsk, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Dpsk', id: 'LIST' }]
    }),
    createDpskPassphrases: build.mutation<CommonResult, RequestPayload<DpskPassphrasesSaveData>>({
      query: ({ params, payload }) => {
        const createDpskPassphrasesReq = createDpskHttpRequest(DpskUrls.addPassphrase, params)
        return {
          ...createDpskPassphrasesReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    updateDpskPassphrases: build.mutation<CommonResult, RequestPayload<DpskPassphrasesSaveData>>({
      query: ({ params, payload }) => {
        const createDpskPassphrasesReq = createDpskHttpRequest(DpskUrls.updatePassphrase, params)
        return {
          ...createDpskPassphrasesReq,
          body: payload
        }
      },
      invalidatesTags: [
        { type: 'DpskPassphrase', id: 'LIST' },
        { type: 'DpskPassphrase', id: 'DETAIL' }
      ]
    }),
    getEnhancedDpskPassphraseList: build.query<TableResult<NewDpskPassphrase>, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskListReq = createDpskHttpRequest(DpskUrls.getEnhancedPassphraseList, params)

        return {
          ...getDpskListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'DpskPassphrase', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_DPSK_PASSPHRASE',
            'CREATE_DPSK_PASSPHRASES',
            'UPDATE_DPSK_PASSPHRASE',
            'DELETE_DPSK_PASSPHRASE',
            'UPDATE_DPSK_PASSPHRASES',
            'IMPORT_DPSK_PASSPHRASES'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'DpskPassphrase', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getDpskPassphrase: build.query<NewDpskPassphrase, RequestPayload>({
      query: ({ params }) => {
        const req = createDpskHttpRequest(DpskUrls.getPassphrase, params)

        return {
          ...req
        }
      },
      providesTags: [{ type: 'DpskPassphrase', id: 'DETAIL' }]
    }),
    deleteDpskPassphraseList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.deletePassphrase, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    revokeDpskPassphraseList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.revokePassphrases, params)
        return {
          ...req,
          body: payload
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }, { type: 'DpskPassphrase', id: 'DETAIL' }]
    }),
    getDpskPassphraseDevices: build.query<DPSKDeviceInfo[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(isDpskNewFlow(params)
          ? DpskUrls.getNewFlowPassphraseDevices
          : DpskUrls.getPassphraseDevices
        , params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'DpskPassphraseDevices', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_PASSPHRASE_DEVICES',
            'DELETE_PASSPHRASE_DEVICES'
          ], () => {
            // eslint-disable-next-line max-len
            api.dispatch(serviceApi.util.invalidateTags( [{ type: 'DpskPassphraseDevices', id: 'LIST' }]))
          })
        })
      }
    }),
    updateDpskPassphraseDevices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(isDpskNewFlow(params)
          ? DpskUrls.updateNewFlowPassphraseDevices
          : DpskUrls.updatePassphraseDevices
        , params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphraseDevices', id: 'LIST' }]
    }),
    deleteDpskPassphraseDevices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(isDpskNewFlow(params)
          ? DpskUrls.deleteNewFlowPassphraseDevices
          : DpskUrls.deletePassphraseDevices
        , params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphraseDevices', id: 'LIST' }]
    }),
    uploadPassphrases: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.uploadPassphrases, params, {
          'Content-Type': undefined
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    downloadPassphrases: build.mutation<Blob, RequestPayload<DpskDownloadPassphrasesPayload>>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(
          DpskUrls.exportPassphrases,
          {
            ...params,
            timezone: payload?.timezone ?? 'UTC',
            dateFormat: payload?.dateFormat ?? 'dd/MM/yyyy HH:mm'
          }
        )

        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'DPSK_Passphrase.csv'
            downloadFile(response, fileName)
          },
          headers: {
            ...req.headers,
            Accept: 'text/csv'
          }
        }
      }
    }),
    // eslint-disable-next-line max-len
    downloadNewFlowPassphrases: build.query<Blob, RequestPayload<DpskDownloadNewFlowPassphrasesPayload>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          DpskUrls.exportNewFlowPassphrases,
          {
            ...params,
            timezone: payload?.timezone ?? 'UTC',
            dateFormat: payload?.dateFormat ?? 'dd/MM/yyyy HH:mm'
          }
        )

        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'DPSK_Passphrase.csv'
            downloadFile(response, fileName)
          },
          headers: {
            ...req.headers,
            'Content-Type': 'application/json',
            'Accept': 'text/csv'
          }
        }
      }
    }),
    // eslint-disable-next-line max-len
    getPassphraseClient: build.query<DpskPassphraseClient, RequestPayload<DpskPassphrasesClientPayload>>({
      query: ({ params, payload }) => {
        const isNewFlow = isDpskNewFlow(params)

        const apiInfo = DpskUrls[isNewFlow ? 'getNewFlowPassphraseClient' : 'getPassphraseClient']
        const apiParams = isNewFlow ? {
          ...params,
          networkId: payload!.networkId,
          mac: payload!.mac
        } : params

        const req = createHttpRequest(apiInfo, apiParams)

        return {
          ...req,
          ...(isNewFlow ? {} : { body: payload })
        }
      },
      transformResponse (result: DpskNewFlowPassphraseClient | DpskPassphraseClient, _, arg) {
        if (!isDpskNewFlow(arg.params)) return result as DpskPassphraseClient

        const res = result as DpskNewFlowPassphraseClient

        return {
          passphraseId: res.id,
          username: res.username,
          passphrase: res.passphrase,
          numberOfDevices: res.numberOfDevices,
          clientMac: res.devices.map(device => device.mac),
          createdDate: res.createdDate,
          expirationDate: res.expirationDate
        } as DpskPassphraseClient
      }
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
    getPortalProfileList: build.query<TableResult<Portal>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PortalUrlsInfo.getPortalProfileList,
          params,
          payload: { ...((payload as TableChangePayload) ?? defaultNewTablePaginationParams),
            pageStartZero: false }
        })

        return {
          ...req
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' },{ type: 'Portal', id: 'LIST' }],
      transformResponse (result: NewAPITableResult<Portal>) {
        return transferNewResToTableResult<Portal>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add Portal Service Profile',
            'Update Portal Service Profile',
            'Delete Portal Service Profile',
            'Delete Portal Service Profiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([{ type: 'Portal', id: 'LIST' }]))
          })
        })
      }
    }),
    getEnhancedPortalProfileList: build.query<TableResult<Portal>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PortalUrlsInfo.getEnhancedPortalProfileList,
          params)

        return {
          ...req,
          body: _.omit(payload as PortalTablePayload, ['defaultPageSize', 'total'])
        }
      },
      transformResponse (result: NewAPITableResult<Portal>) {
        return transferNewResToTableResult<Portal>(result)
      },
      providesTags: [{ type: 'Service', id: 'LIST' },{ type: 'Portal', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add Portal Service Profile',
            'Update Portal Service Profile',
            'Delete Portal Service Profile',
            'Delete Portal Service Profiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([{ type: 'Portal', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
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
  useServiceListQuery,
  useGetDHCPProfileQuery,
  useSaveOrUpdateDHCPMutation,
  useDeleteDHCPServiceMutation,
  useAccessControlProfileListQuery,
  useGetDHCPProfileListQuery,
  useLazyGetDHCPProfileListQuery,
  useGetMdnsProxyQuery,
  useLazyGetMdnsProxyListQuery,
  useGetMdnsProxyListQuery,
  useGetEnhancedMdnsProxyListQuery,
  useAddMdnsProxyMutation,
  useUpdateMdnsProxyMutation,
  useDeleteMdnsProxyMutation,
  useDeleteMdnsProxyListMutation,
  useAddMdnsProxyApsMutation,
  useDeleteMdnsProxyApsMutation,
  useGetMdnsProxyApsQuery,
  useDeleteWifiCallingServicesMutation,
  useDeleteWifiCallingServiceMutation,
  useGetWifiCallingServiceQuery,
  useGetWifiCallingServiceListQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useCreateWifiCallingServiceMutation,
  useUpdateWifiCallingServiceMutation,
  useCreateDpskMutation,
  useUpdateDpskMutation,
  useGetDpskQuery,
  useLazyGetDpskQuery,
  useGetDpskListQuery,
  useLazyGetDpskListQuery,
  useGetEnhancedDpskListQuery,
  useDeleteDpskMutation,
  useGetEnhancedDpskPassphraseListQuery,
  useLazyGetEnhancedDpskPassphraseListQuery,
  useGetDpskPassphraseQuery,
  useCreateDpskPassphrasesMutation,
  useUpdateDpskPassphrasesMutation,
  useDeleteDpskPassphraseListMutation,
  useRevokeDpskPassphraseListMutation,
  useGetDpskPassphraseDevicesQuery,
  useLazyGetDpskPassphraseDevicesQuery,
  useUpdateDpskPassphraseDevicesMutation,
  useDeleteDpskPassphraseDevicesMutation,
  useUploadPassphrasesMutation,
  useDownloadPassphrasesMutation,
  useLazyDownloadNewFlowPassphrasesQuery,
  useGetPassphraseClientQuery,
  useGetPortalQuery,
  useSavePortalMutation,
  useGetPortalProfileDetailQuery,
  useLazyGetPortalProfileListQuery,
  useGetPortalProfileListQuery,
  useGetPortalLangMutation,
  useDeletePortalMutation,
  useUpdatePortalMutation,
  useUploadURLMutation,
  useGetDHCPProfileListViewModelQuery,
  useGetEnhancedPortalProfileListQuery
} = serviceApi

function isDpskNewFlow (params?: Params<string>): boolean {
  return params?.isNewConfigFlow === 'y'
}

export type DpskNewConfigFlowParamsValue = 'y' | 'n'

export function transferDpskNewConfigApiInfo (apiInfo: ApiInfo, params?: Params<string>): ApiInfo {
  if (!isDpskNewFlow(params)) return apiInfo

  return { ...apiInfo, url: convertDpskNewFlowUrl(apiInfo.url) }
}

export function createDpskHttpRequest (
  apiInfo: ApiInfo,
  params?: Params<string>,
  customHeaders?: Record<string, unknown>,
  ignoreDelegation?: boolean
) {
  const newApiInfo = transferDpskNewConfigApiInfo(apiInfo, params)

  return createHttpRequest(newApiInfo, params, customHeaders, ignoreDelegation)
}
