/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { QueryReturnValue }                        from '@reduxjs/toolkit/query'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { cloneDeep, find }                         from 'lodash'

import {
  ApCompatibility,
  ApCompatibilityResponse,
  ApiVersionEnum,
  CommonRbacUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  ConfigTemplateUrlsInfo,
  Dashboard,
  ExternalProviders,
  GetApiVersionHeader,
  Network,
  NetworkDetail,
  NetworkDetailHeader,
  NetworkRadiusSettings,
  NetworkSaveData,
  NetworkVenue,
  TableResult,
  Venue,
  VenueConfigTemplateUrlsInfo,
  WifiNetwork,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  onActivityMessageReceived,
  onSocketActivityChanged,
  transformNetwork,
  RadioTypeEnum,
  BaseNetwork,
  VlanPoolRbacUrls,
  VLANPoolViewModelRbacType,
  transformWifiNetwork,
  DpskSaveData,
  CertificateTemplate,
  ExternalWifiProviders,
  CompatibilityResponse,
  Compatibility,
  IncompatibleFeatureLevelEnum,
  NewTableResult,
  transferToTableResult,
  MacRegistrationPool,
  TxStatus,
  NewAPModel,
  VlanPool
} from '@acx-ui/rc/utils'
import { baseNetworkApi }                      from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import {
  aggregatedRbacNetworksVenueData,
  aggregatedRbacVenueNetworksData,
  fetchEnhanceRbacApGroupNetworkVenueList,
  fetchEnhanceRbacNetworkVenueList,
  fetchEnhanceRbacVenueNetworkList,
  fetchNetworkVlanPoolList,
  fetchRbacAccessControlPolicyNetwork,
  fetchRbacAccessControlSubPolicyNetwork,
  fetchRbacApGroupNetworkVenueList,
  fetchRbacNetworkVenueList,
  fetchRbacVenueNetworkList,
  getNetworkDeepList, updateNetworkVenueFn
} from './networkVenueUtils'
import { commonQueryFn } from './servicePolicy.utils'
import {
  handleCallbackWhenActivityDone,
  isPayloadHasField
} from './utils'


const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

const NetworkUseCases = [
  // non-RBAC API
  'AddNetwork',
  'UpdateNetwork',
  'DeleteNetwork',
  // RBAC API
  'AddWifiNetwork',
  'UpdateWifiNetwork',
  'DeleteWifiNetwork'
]

export const networkApi = baseNetworkApi.injectEndpoints({
  endpoints: (build) => ({
    networkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        return {
          ...networkListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<Network>) {
        result.data = result.data.map(item => ({
          ...transformNetwork(item)
        })) as Network[]
        return result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    networkTable: build.query<TableResult<Network>, RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        const networkListQuery = await fetchWithBQ({ ...networkListReq, body: payload })
        const networkList = networkListQuery.data as TableResult<Network>
        const networkIds = networkList?.data?.filter(n => n.aps > 0).map(n => n.id) || []
        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allApCompatibilitiesQuery:any = await Promise.all(networkIds.map(id => {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, { networkId: id }),
              body: { filters: {} }
            }
            return fetchWithBQ(apCompatibilitiesReq)
          }))
          networkIds.forEach((id:string, index:number) => {
            const allApCompatibilitiesResponse = allApCompatibilitiesQuery[index]?.data as ApCompatibilityResponse
            const allApCompatibilitiesData = allApCompatibilitiesResponse?.apCompatibilities as ApCompatibility[]
            networkIdsToIncompatible[id] = allApCompatibilitiesData[0]?.incompatible ?? 0
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedNetworkCompatibilitiesData(
          networkList, networkIdsToIncompatible)

        return networkListQuery.data
          ? { data: aggregatedList }
          : { error: networkListQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // RBAC API
    wifiNetworkList: build.query<TableResult<WifiNetwork>, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params, apiCustomHeader)
        return {
          ...networkListReq,
          body: JSON.stringify(payload)
        }
      },
      transformResponse (result: TableResult<WifiNetwork>) {
        result.data = result.data.map(item => ({
          ...transformWifiNetwork(item)
        })) as WifiNetwork[]
        return result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    wifiNetworkTable: build.query<TableResult<WifiNetwork>, RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params, apiCustomHeader)
        const networkListQuery = await fetchWithBQ({ ...networkListReq, body: JSON.stringify(payload) })
        const networkList = networkListQuery.data as TableResult<WifiNetwork>
        const networkIds = networkList?.data?.filter(n => n.apCount).map(n => n.id) || []
        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allApCompatibilitiesQuery:any = await Promise.all(networkIds.map(id => {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, { networkId: id }, apiCustomHeader),
              body: JSON.stringify({ filters: {} })
            }
            return fetchWithBQ(apCompatibilitiesReq)
          }))
          networkIds.forEach((id:string, index:number) => {
            const allApCompatibilitiesResponse = allApCompatibilitiesQuery[index]?.data as ApCompatibilityResponse
            const allApCompatibilitiesData = allApCompatibilitiesResponse?.apCompatibilities as ApCompatibility[]
            networkIdsToIncompatible[id] = allApCompatibilitiesData[0]?.incompatible ?? 0
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedWifiNetworkCompatibilitiesData(
          networkList, networkIdsToIncompatible) as TableResult<WifiNetwork>

        return networkListQuery.data
          ? { data: aggregatedList }
          : { error: networkListQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    enhanceWifiNetworkTable: build.query<TableResult<WifiNetwork>, RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params, apiCustomHeader)
        const networkListQuery = await fetchWithBQ({ ...networkListReq, body: JSON.stringify(payload) })
        const networkList = networkListQuery.data as TableResult<WifiNetwork>
        // vlan pooling
        const networkIds = networkList?.data?.map(n => n.id) ?? []
        if (networkIds.length > 0) {
          const vlanPoolListQuery = await fetchWithBQ({
            ...createHttpRequest(VlanPoolRbacUrls.getVLANPoolPolicyList),
            body: JSON.stringify({
              fields: [ 'id' , 'name', 'wifiNetworkIds'],
              filters: { wifiNetworkIds: networkIds }
            })
          })
          const vlanPoolList = vlanPoolListQuery.data as TableResult<VLANPoolViewModelRbacType>

          networkList.data.forEach(network => {
            const networkId = network.id
            const networkVlanPool = vlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))
            if (networkVlanPool) {
              network.vlanPool = {
                name: networkVlanPool.name
              }
            }
          })
        }

        // apCompatibily
        const apNetworkIds = networkList?.data?.filter(n => n.apCount).map(n => n.id) ?? []
        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiRbacUrlsInfo.getNetworkApCompatibilities, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
            body: JSON.stringify({
              filters: {
                wifiNetworkIds: apNetworkIds,
                featureLevels: [IncompatibleFeatureLevelEnum.WIFI_NETWORK]
              },
              page: 1,
              pageSize: 100
            })
          }

          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = (apCompatibilitiesQuery.data) as CompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse?.compatibilities

          apNetworkIds.forEach((id:string, index:number) => {
            networkIdsToIncompatible[id] = apCompatibilities?.[index]?.incompatible ?? 0
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedWifiNetworkCompatibilitiesData(
          networkList, networkIdsToIncompatible) as TableResult<WifiNetwork>

        return networkListQuery.data
          ? { data: aggregatedList }
          : { error: networkListQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = enableRbac? {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...RKS_NEW_UI
        } : RKS_NEW_UI

        const createNetworkReq = createHttpRequest(urlsInfo.addNetworkDeep, params, apiCustomHeader)
        return {
          ...createNetworkReq,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response && msg.useCase === 'AddNetwork' && msg.status === 'SUCCESS') {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    updateNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = enableRbac? {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...RKS_NEW_UI
        } : RKS_NEW_UI

        const req = createHttpRequest(urlsInfo.updateNetworkDeep, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.deleteNetwork, params, apiCustomHeader)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    addRbacNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.addNetworkVenue, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          const { useCase, status } = msg
          const targetUseCase = 'ActivateWifiNetworkOnVenue'
          if (useCase === targetUseCase && status === TxStatus.SUCCESS) {
            await handleCallbackWhenActivityDone({
              api,
              activityData: msg,
              useCase: targetUseCase,
              callback: requestArgs.callback,
              failedCallback: requestArgs.failedCallback
            })
          }
        })
      }
    }),
    // non-RBAC API
    addNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    // RBAC API doesn't support this
    addNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    updateNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      queryFn: updateNetworkVenueFn(),
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    // RBAC API doesn't support this
    updateNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteRbacNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.deleteNetworkVenue, params, apiCustomHeader)
        return {
          ...req
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          const { useCase, status } = msg
          const targetUseCase = 'DeactivateWifiNetworkOnVenue'
          if (useCase === targetUseCase && status === TxStatus.SUCCESS) {
            await handleCallbackWhenActivityDone({
              api,
              activityData: msg,
              useCase: targetUseCase,
              callback: requestArgs.callback,
              failedCallback: requestArgs.failedCallback
            })
          }
        })
      }
    }),
    // non-RBAC API
    deleteNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    // RBAC API doesn't support this
    deleteNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    getNetwork: build.query<NetworkSaveData | null, RequestPayload>({
      async queryFn ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = enableRbac? {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...RKS_NEW_UI
        } : RKS_NEW_UI

        const networkQuery = await fetchWithBQ(
          createHttpRequest(urlsInfo.getNetwork, params, apiCustomHeader)
        )

        if ((networkQuery as QueryReturnValue<NetworkSaveData, FetchBaseQueryError, FetchBaseQueryMeta>).data?.wlan?.advancedCustomization?.devicePolicyId) {
          (networkQuery as QueryReturnValue<NetworkSaveData, FetchBaseQueryError, FetchBaseQueryMeta>).data!.wlan!.advancedCustomization!.enableDeviceOs = true
        }

        return networkQuery as QueryReturnValue<NetworkSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    getNetworkDeep: build.query<NetworkSaveData | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const networkQuery = await fetchWithBQ(
          createHttpRequest(
            WifiRbacUrlsInfo.getNetwork,
            params,
            GetApiVersionHeader(ApiVersionEnum.v1)
          )
        )
        const networkDeepData = networkQuery.data as NetworkSaveData

        if (networkDeepData) {
          const arg = {
            params,
            payload: { page: 1, pageSize: 10000 }
          }

          const { networkId } = params
          // fetch network vlan pool info
          const networkVlanPoolList = await fetchNetworkVlanPoolList([networkId], false, fetchWithBQ)
          const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))

          const {
            error: networkVenuesListQueryError,
            networkDeep
          } = await fetchRbacNetworkVenueList(arg, fetchWithBQ)

          const {
            error: accessControlPolicyNetworkError,
            data: accessControlPolicyNetwork
          } = await fetchRbacAccessControlPolicyNetwork(arg, fetchWithBQ)

          const {
            error: accessControlSubPolicyNetworkError,
            data: accessControlSubPolicyNetwork
          } = await fetchRbacAccessControlSubPolicyNetwork(arg, fetchWithBQ)

          if (networkVenuesListQueryError)
            return { error: networkVenuesListQueryError }

          if (accessControlPolicyNetworkError)
            return { error: accessControlPolicyNetworkError }

          if (accessControlSubPolicyNetworkError)
            return { error: accessControlSubPolicyNetworkError }

          if (networkDeep?.venues) {
            networkDeepData.venues = cloneDeep(networkDeep.venues)
          }

          if (networkVlanPool && networkDeepData.wlan?.advancedCustomization) {
            const { id , name } = networkVlanPool
            networkDeepData.wlan.advancedCustomization.vlanPool = { id , name } as VlanPool
          }

          if (accessControlPolicyNetwork?.data.length > 0 && networkDeepData.wlan?.advancedCustomization) {
            networkDeepData.wlan.advancedCustomization.accessControlEnable = true
            networkDeepData.wlan.advancedCustomization.accessControlProfileId = accessControlPolicyNetwork.data[0].id
          }

          if (!accessControlPolicyNetwork?.data.length && Object.keys(accessControlSubPolicyNetwork).length && networkDeepData.wlan?.advancedCustomization) {
            networkDeepData.wlan.advancedCustomization = {
              ...networkDeepData.wlan.advancedCustomization,
              ...accessControlSubPolicyNetwork
            }
          }
        }

        return networkQuery as QueryReturnValue<NetworkSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const useCases = [
            'UpdateNetworkVenue',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings',
            'DeactivateApGroupOnWifiNetwork',
            'ActivateApGroupOnWifiNetwork'
          ]

          onActivityMessageReceived(msg, useCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    // replace getNetworkDeep
    getNetworkDeepV2: build.query<NetworkSaveData | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const networkQuery = await fetchWithBQ(
          createHttpRequest(
            WifiRbacUrlsInfo.getNetwork,
            params,
            GetApiVersionHeader(ApiVersionEnum.v1)
          )
        )
        const networkDeepData = networkQuery.data as NetworkSaveData

        if (networkDeepData) {
          const arg = {
            params,
            payload: { page: 1, pageSize: 10000 }
          }

          const { networkId } = params
          // fetch network vlan pool info
          const networkVlanPoolList = await fetchNetworkVlanPoolList([networkId], false, fetchWithBQ)
          const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))

          const {
            error: networkVenuesListQueryError,
            networkDeep
          } = await fetchEnhanceRbacNetworkVenueList(arg, fetchWithBQ)

          const {
            error: accessControlPolicyNetworkError,
            data: accessControlPolicyNetwork
          } = await fetchRbacAccessControlPolicyNetwork(arg, fetchWithBQ)

          const {
            error: accessControlSubPolicyNetworkError,
            data: accessControlSubPolicyNetwork
          } = await fetchRbacAccessControlSubPolicyNetwork(arg, fetchWithBQ)

          if (networkVenuesListQueryError)
            return { error: networkVenuesListQueryError }

          if (accessControlPolicyNetworkError)
            return { error: accessControlPolicyNetworkError }

          if (accessControlSubPolicyNetworkError)
            return { error: accessControlSubPolicyNetworkError }

          if (networkDeep?.venues) {
            networkDeepData.venues = cloneDeep(networkDeep.venues)
          }

          if (networkVlanPool && networkDeepData.wlan?.advancedCustomization) {
            const { id , name } = networkVlanPool
            networkDeepData.wlan.advancedCustomization.vlanPool = { id , name } as VlanPool
          }

          if (accessControlPolicyNetwork?.data.length > 0 && networkDeepData.wlan?.advancedCustomization) {
            networkDeepData.wlan.advancedCustomization.accessControlEnable = true
            networkDeepData.wlan.advancedCustomization.accessControlProfileId = accessControlPolicyNetwork.data[0].id
          }

          if (!accessControlPolicyNetwork?.data.length && Object.keys(accessControlSubPolicyNetwork).length && networkDeepData.wlan?.advancedCustomization) {
            networkDeepData.wlan.advancedCustomization = {
              ...networkDeepData.wlan.advancedCustomization,
              ...accessControlSubPolicyNetwork
            }
          }
        }

        return networkQuery as QueryReturnValue<NetworkSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const useCases = [
            'UpdateNetworkVenue',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings',
            'DeactivateApGroupOnWifiNetwork',
            'ActivateApGroupOnWifiNetwork'
          ]

          onActivityMessageReceived(msg, useCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    networkDetailHeader: build.query<NetworkDetailHeader, RequestPayload>({
      async queryFn ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) {
        if (enableRbac) {
          const networkId = params?.networkId
          const { isTemplate } = (payload ?? {}) as { isTemplate: boolean }
          const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
          const networkListQueryPayload = {
            fields: ['name', 'venueApGroups', 'apCount', 'clientCount'],
            page: 1,
            pageSize: 10
          }

          const apiInfo = (isTemplate)
            ? ConfigTemplateUrlsInfo.getNetworkTemplateListRbac
            : CommonRbacUrlsInfo.getWifiNetworksList

          const NetworkListReq = {
            ...createHttpRequest(apiInfo, undefined, customHeaders),
            body: JSON.stringify({
              ...networkListQueryPayload,
              filters: {
                id: [networkId]
              }
            })
          }
          const networkListQuery = await fetchWithBQ(NetworkListReq)
          const networkList = networkListQuery.data as TableResult<WifiNetwork>
          const currentNetwork = networkList?.data?.[0]
          const { name, venueApGroups=[], apCount=0, clientCount=0 } = currentNetwork || {}

          const networkDetailHeader = {
            activeVenueCount: venueApGroups.length,
            aps: { totalApCount: apCount },
            network: { name, id: networkId, clients: clientCount }
          } as NetworkDetailHeader

          return { data: networkDetailHeader }

        } else {
          const networkDetailHeaderReq = createHttpRequest(
            CommonRbacUrlsInfo.getNetworksDetailHeader,
            params)

          const networkDetailHeaderQuery = await fetchWithBQ(networkDetailHeaderReq)

          return networkDetailHeaderQuery as QueryReturnValue<NetworkDetailHeader,
          FetchBaseQueryError,
          FetchBaseQueryMeta>
        }

      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const USE_CASES = [
            'AddNetworkVenue',
            'AddNetworkVenueMappings',
            'DeleteNetworkVenue',
            'DeleteNetworkVenues',
            'UpdateNetworkDeep',
            'UpdateNetworkVenue',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings'
          ]
          const CONFIG_TEMPLATE_USE_CASES = [
            'DeleteNetworkVenueTemplate',
            'DeleteNetworkVenueTemplates',
            'AddNetworkVenueTemplate',
            'AddNetworkVenueTemplateMappings',
            'UpdateNetworkVenueTemplate'
          ]
          const useCases = (requestArgs.payload as { isTemplate?: boolean })?.isTemplate ? CONFIG_TEMPLATE_USE_CASES : USE_CASES
          onActivityMessageReceived(msg, useCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),

    apNetworkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApNetworkList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getRbacApNetworkList: build.query<TableResult<Network | WifiNetwork>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { serialNumber } = arg.params || {}
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)

        // get current AP (AP List filter by serial)
        const apListReq = {
          ...createHttpRequest(CommonRbacUrlsInfo.getApsList, undefined, customHeaders),
          body: JSON.stringify({
            entityType: 'aps',
            fields: ['name', 'serialNumber', 'apGroupId', 'venueId'],
            filters: { serialNumber: [serialNumber] }
          })
        }
        const apListQuery = await fetchWithBQ(apListReq)
        const apList = apListQuery.data as TableResult<NewAPModel>
        const apGroupId = apList?.data?.[0].apGroupId


        // get AP's network (filter by apGroup ID)
        const payload = (arg.payload ?? {}) as {
          searchString?: string,
          fields?: string[],
          page?: number,
          pageSize?: number }

        const NetworkListReq = {
          ...createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, undefined, customHeaders),
          body: JSON.stringify({
            ...payload,
            filters: {
              'venueApGroups.apGroupIds': [apGroupId]
            }
          })
        }

        const networkListQuery = await fetchWithBQ(NetworkListReq)
        const networkList = networkListQuery.data as TableResult<WifiNetwork>
        const networkIds = networkList.data.map(network => network.id)

        // vlan pooling
        if (networkIds.length > 0) {
          const vlanPoolListQuery = await fetchWithBQ({
            ...createHttpRequest(VlanPoolRbacUrls.getVLANPoolPolicyList),
            body: JSON.stringify({
              fields: [ 'id' , 'name', 'wifiNetworkIds'],
              filters: { wifiNetworkIds: networkIds }
            })
          })
          const vlanPoolList = vlanPoolListQuery.data as TableResult<VLANPoolViewModelRbacType>

          networkList.data.forEach(network => {
            const networkId = network.id
            const networkVlanPool = vlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))
            if (networkVlanPool) {
              network.vlanPool = {
                name: networkVlanPool.name
              }
            }
          })
        }

        return { data: networkList }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    networkVenueListV2: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          networkVenuesListQuery,
          networkVenuesList,
          networkVenuesApGroupList,
          networkDeep
        } = await fetchNetworkVenueListV2(arg, fetchWithBQ)

        const aggregatedList = aggregatedNetworksVenueDataV2(
          networkVenuesList, networkVenuesApGroupList, networkDeep)

        return networkVenuesListQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    networkVenueTableV2: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          networkVenuesListQuery,
          networkVenuesList,
          networkVenuesApGroupList,
          networkDeep,
          venueIds
        } = await fetchNetworkVenueListV2(arg, fetchWithBQ)

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, arg.params),
            body: { filters: { venueIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            venueIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('networkVenueTable getApCompatibilitiesNetwork error:', e)
        }
        const aggregatedList = aggregatedNetworksVenueDataV2(
          networkVenuesList, networkVenuesApGroupList, networkDeep, venueIdsToIncompatible)

        return networkVenuesListQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // RBAC API
    newNetworkVenueTable: build.query<TableResult<Venue>, RequestPayload<{ isTemplate?: boolean }>>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkVenuesListQueryError,
          networkVenuesList,
          networkViewmodel,
          networkDeep,
          venueIds
        } = await fetchRbacNetworkVenueList(arg, fetchWithBQ)

        if (networkVenuesListQueryError)
          return { error: networkVenuesListQueryError }

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        if (isPayloadHasField(arg.payload, 'incompatible') && !arg.payload?.isTemplate) {
          try {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, arg.params),
              body: { filters: { venueIds } }
            }
            const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
            const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
            const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
            apCompatibilities.forEach((item:ApCompatibility) => {
              venueIdsToIncompatible[item.id] = item.incompatible
            })
          } catch (e) {
          // eslint-disable-next-line no-console
            console.error('networkVenueTable getApCompatibilitiesNetwork error:', e)
          }
        }

        const aggregatedList = aggregatedRbacNetworksVenueData(
          networkVenuesList, networkViewmodel, networkDeep, venueIdsToIncompatible)

        return { data: aggregatedList }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateNetworkDeep',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings',
            'DeactivateApGroupOnWifiNetwork',
            'ActivateApGroupOnWifiNetwork'
          ], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    enhanceNetworkVenueTable: build.query<TableResult<Venue>, RequestPayload<{ isTemplate?: boolean }>>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkVenuesListQueryError,
          networkVenuesList,
          networkViewmodel,
          networkDeep,
          venueIds
        } = await fetchRbacNetworkVenueList(arg, fetchWithBQ)

        if (networkVenuesListQueryError)
          return { error: networkVenuesListQueryError }

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        if (isPayloadHasField(arg.payload, 'incompatible') && !arg.payload?.isTemplate) {
          try {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiRbacUrlsInfo.getVenueApCompatibilities, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
              body: JSON.stringify({
                filters: {
                  venueIds: venueIds,
                  wifiNetworkIds: [arg.params!.networkId],
                  featureLevels: [IncompatibleFeatureLevelEnum.VENUE, IncompatibleFeatureLevelEnum.WIFI_NETWORK]
                },
                page: 1,
                pageSize: 100
              })
            }

            const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
            const apCompatibilitiesResponse = (apCompatibilitiesQuery.data) as CompatibilityResponse
            const apCompatibilities = apCompatibilitiesResponse?.compatibilities

            apCompatibilities.forEach((item: Compatibility) => {
              venueIdsToIncompatible[item.id] = item.incompatible ?? 0
            })
          } catch (e) {
          // eslint-disable-next-line no-console
            console.error('networkVenueTable getApCompatibilitiesNetwork error:', e)
          }
        }

        const aggregatedList = aggregatedRbacNetworksVenueData(
          networkVenuesList, networkViewmodel, networkDeep, venueIdsToIncompatible)

        return { data: aggregatedList }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateNetworkDeep',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings',
            'DeactivateApGroupOnWifiNetwork',
            'ActivateApGroupOnWifiNetwork'
          ], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),

    enhanceNetworkVenueTableV2: build.query<TableResult<Venue>, RequestPayload<{ isTemplate?: boolean }>>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkVenuesListQueryError,
          networkVenuesList,
          networkViewmodel,
          networkDeep,
          venueIds
        } = await fetchEnhanceRbacNetworkVenueList(arg, fetchWithBQ)

        if (networkVenuesListQueryError)
          return { error: networkVenuesListQueryError }

        const venueIdsToIncompatible:{ [key:string]: number } = {}
        if (isPayloadHasField(arg.payload, 'incompatible') && !arg.payload?.isTemplate) {
          try {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiRbacUrlsInfo.getVenueApCompatibilities, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
              body: JSON.stringify({
                filters: {
                  venueIds: venueIds,
                  wifiNetworkIds: [arg.params!.networkId],
                  featureLevels: [IncompatibleFeatureLevelEnum.VENUE, IncompatibleFeatureLevelEnum.WIFI_NETWORK]
                },
                page: 1,
                pageSize: 100
              })
            }

            const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
            const apCompatibilitiesResponse = (apCompatibilitiesQuery.data) as CompatibilityResponse
            const apCompatibilities = apCompatibilitiesResponse?.compatibilities

            apCompatibilities.forEach((item: Compatibility) => {
              venueIdsToIncompatible[item.id] = item.incompatible ?? 0
            })
          } catch (e) {
          // eslint-disable-next-line no-console
            console.error('networkVenueTable getApCompatibilitiesNetwork error:', e)
          }
        }

        const aggregatedList = aggregatedRbacNetworksVenueData(
          networkVenuesList, networkViewmodel, networkDeep, venueIdsToIncompatible)

        return { data: aggregatedList }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateNetworkDeep',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings',
            'DeactivateApGroupOnWifiNetwork',
            'ActivateApGroupOnWifiNetwork'
          ], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    venueNetworkListV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { venueNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList } = await fetchVenueNetworkListV2(arg, fetchWithBQ)

        const aggregatedList = aggregatedVenueNetworksDataV2(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      extraOptions: { maxRetries: 5 }
    }),
    venueRadioActiveNetworks: build.query<Network[], RequestPayload & { radio: RadioTypeEnum }>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const [networkActivationsQuery, networksQuery] = await Promise.all([
          fetchWithBQ({
            ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params),
            body: arg.payload
          }),
          fetchWithBQ({
            ...createHttpRequest(CommonUrlsInfo.getVenueNetworkList, arg.params),
            body: arg.payload
          })
        ]) as [{ data: { data: NetworkVenue[] } }, { data: { data: Network[] } }]
        const active = networkActivationsQuery.data.data.reduce(
          (active: Record<string, boolean>, network: NetworkVenue) => {
            if (network.allApGroupsRadioTypes?.includes(arg.radio)) {
              active[network.networkId as string] = true
            }
            return active
          },
          {} as Record<string, boolean>
        )
        return {
          data: networksQuery.data.data.filter(network => active[network.id])
        }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    venueNetworkTableV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { venueNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList,
          networkIds } = await fetchVenueNetworkListV2(arg, fetchWithBQ)

        const networkIdsToIncompatible:{ [key:string]: number } = {}
        try {
          const apCompatibilitiesReq = {
            ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesVenue, arg.params),
            body: { filters: { networkIds } }
          }
          const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
          const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
          const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
          apCompatibilities.forEach((item:ApCompatibility) => {
            networkIdsToIncompatible[item.id] = item.incompatible
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('venueNetworkTable getApCompatibilitiesVenue error:', e)
        }

        const aggregatedList = aggregatedVenueNetworksDataV2(
          networkList, venueNetworkApGroupList, networkDeepListList, networkIdsToIncompatible)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      extraOptions: { maxRetries: 5 }
    }),
    newVenueNetworkTable: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkListQueryError,
          networkList,
          networkDeepListList,
          networkIds } = await fetchRbacVenueNetworkList(arg, fetchWithBQ)

        if (networkListQueryError)
          return { error: networkListQueryError }

        const networkIdsToIncompatible:{ [key:string]: number } = {}
        if (!(arg.payload as any).isTemplate) {
          try {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiUrlsInfo.getApCompatibilitiesVenue, arg.params),
              body: { filters: { networkIds } }
            }
            const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
            const apCompatibilitiesResponse = apCompatibilitiesQuery.data as ApCompatibilityResponse
            const apCompatibilities = apCompatibilitiesResponse.apCompatibilities as ApCompatibility[]
            apCompatibilities.forEach((item:ApCompatibility) => {
              networkIdsToIncompatible[item.id] = item.incompatible
            })
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('venueNetworkTable getApCompatibilitiesVenue error:', e)
          }
        }

        const aggregatedList = aggregatedRbacVenueNetworksData(
          arg.params?.venueId!, networkList,
          networkDeepListList, networkIdsToIncompatible)

        return { data: aggregatedList }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateNetworkDeep',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings'
          ], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    enhanceVenueNetworkTable: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkListQueryError,
          networkList,
          networkDeepListList,
          networkIds } = await fetchRbacVenueNetworkList(arg, fetchWithBQ)

        if (networkListQueryError)
          return { error: networkListQueryError }

        const networkIdsToIncompatible:{ [key:string]: number } = {}
        if (!(arg.payload as any).isTemplate) {
          try {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiRbacUrlsInfo.getNetworkApCompatibilities, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
              body: JSON.stringify({
                filters: {
                  venueIds: [ arg.params!.venueId],
                  wifiNetworkIds: networkIds,
                  featureLevels: [IncompatibleFeatureLevelEnum.VENUE, IncompatibleFeatureLevelEnum.WIFI_NETWORK]
                },
                page: 1,
                pageSize: 100
              })
            }

            const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
            const apCompatibilitiesResponse = (apCompatibilitiesQuery.data) as CompatibilityResponse
            const apCompatibilities = apCompatibilitiesResponse?.compatibilities

            apCompatibilities.forEach((item: Compatibility) => {
              networkIdsToIncompatible[item.id] = item.incompatible ?? 0
            })
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('venueNetworkTable getApCompatibilitiesVenue error:', e)
          }
        }

        const aggregatedList = aggregatedRbacVenueNetworksData(
          arg.params?.venueId!, networkList,
          networkDeepListList, networkIdsToIncompatible)

        return { data: aggregatedList }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateNetworkDeep',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings',
            'UpdateVenueWifiNetworkTemplateSettings'
          ], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // method name will be renamed after feature flag is removed
    enhanceVenueNetworkTableV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: networkListQueryError,
          networkList,
          networkDeepListList,
          networkIds } = await fetchEnhanceRbacVenueNetworkList(arg, fetchWithBQ)

        if (networkListQueryError)
          return { error: networkListQueryError }

        const networkIdsToIncompatible:{ [key:string]: number } = {}
        if (!(arg.payload as any).isTemplate) {
          try {
            const apCompatibilitiesReq = {
              ...createHttpRequest(WifiRbacUrlsInfo.getNetworkApCompatibilities, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
              body: JSON.stringify({
                filters: {
                  venueIds: [ arg.params!.venueId],
                  wifiNetworkIds: networkIds,
                  featureLevels: [IncompatibleFeatureLevelEnum.VENUE, IncompatibleFeatureLevelEnum.WIFI_NETWORK]
                },
                page: 1,
                pageSize: 100
              })
            }

            const apCompatibilitiesQuery = await fetchWithBQ(apCompatibilitiesReq)
            const apCompatibilitiesResponse = (apCompatibilitiesQuery.data) as CompatibilityResponse
            const apCompatibilities = apCompatibilitiesResponse?.compatibilities

            apCompatibilities.forEach((item: Compatibility) => {
              networkIdsToIncompatible[item.id] = item.incompatible ?? 0
            })
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('venueNetworkTable getApCompatibilitiesVenue error:', e)
          }
        }

        const aggregatedList = aggregatedRbacVenueNetworksData(
          arg.params?.venueId!, networkList,
          networkDeepListList, networkIdsToIncompatible)

        return { data: aggregatedList }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateNetworkDeep',
            'ActivateWifiNetworkOnVenue',
            'ActivateWifiNetworkTemplateOnVenue',
            'DeactivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkTemplateOnVenue',
            'UpdateVenueWifiNetworkSettings',
            'UpdateVenueWifiNetworkTemplateSettings'
          ], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    apGroupNetworkListV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { apGroupNetworkListQuery,
          networkList,
          venueNetworkApGroupList,
          networkDeepListList } = await fetchApGroupNetworkVenueListV2(arg, fetchWithBQ)

        const aggregatedList = aggregatedVenueNetworksDataV2(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return apGroupNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: apGroupNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    newApGroupNetworkList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: apGroupNetworkListQueryError,
          networkList,
          networkDeepListList
        } = await fetchRbacApGroupNetworkVenueList(arg, fetchWithBQ)

        if (apGroupNetworkListQueryError)
          return { error: apGroupNetworkListQueryError as FetchBaseQueryError }

        const aggregatedList = aggregatedRbacVenueNetworksData(
          arg.params?.venueId!,
          networkList, networkDeepListList)

        return { data: aggregatedList }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),

    newApGroupNetworkListV2: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const {
          error: apGroupNetworkListQueryError,
          networkList,
          networkDeepListList
        } = await fetchEnhanceRbacApGroupNetworkVenueList(arg, fetchWithBQ)

        if (apGroupNetworkListQueryError)
          return { error: apGroupNetworkListQueryError as FetchBaseQueryError }

        const aggregatedList = aggregatedRbacVenueNetworksData(
          arg.params?.venueId!,
          networkList, networkDeepListList)

        return { data: aggregatedList }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getApCompatibilitiesNetwork: build.query<ApCompatibilityResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApCompatibilitiesNetwork, params, { ...ignoreErrorModal })
        return{
          ...req,
          body: payload
        }
      }
    }),
    // replace the getApCompatibilitiesNetwork
    getNetworkApCompatibilities: build.query<CompatibilityResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...ignoreErrorModal
        }

        const req = createHttpRequest(WifiRbacUrlsInfo.getNetworkApCompatibilities, params, apiCustomHeader)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    venueNetworkActivationsDataList: build.query<NetworkSaveData[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const networkActivations = {
          ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params),
          body: arg.payload
        }
        const networkActivationsQuery = await fetchWithBQ(networkActivations)
        const networkVenueList = networkActivationsQuery.data as TableResult<NetworkVenue>

        let networkDeepList = { response: [] } as { response: NetworkSaveData[] }

        if (networkVenueList && networkVenueList.data && networkVenueList.data.length > 0) {
          const networkIds = networkVenueList.data.map(item => item.networkId!) || []
          networkDeepList = await getNetworkDeepList(networkIds, fetchWithBQ)
        }

        return { data: networkDeepList.response }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    venueNetworkActivationsViewModelList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const networkApiPayload = arg.payload as Record<string, unknown>
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)

        const networkListQuery = await fetchWithBQ({
          ...createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, apiCustomHeader),
          body: JSON.stringify(networkApiPayload) })

        const networksList = networkListQuery.data as TableResult<WifiNetwork>

        // fetch vlan pool info
        const networkIds = networksList?.data.map(item => item.id!) || []
        if (networksList.data.length && (networkApiPayload?.fields as string[])?.includes('vlanPool')) {
          const vlanPoolListQuery = await fetchWithBQ({
            ...createHttpRequest(VlanPoolRbacUrls.getVLANPoolPolicyList),
            body: JSON.stringify({
              fields: ['id', 'name', 'wifiNetworkIds'],
              filters: { wifiNetworkIds: networkIds }
            }) })

          const vlanPoolList = vlanPoolListQuery.data as TableResult<VLANPoolViewModelRbacType>

          networksList.data.forEach(network => {
            network.vlanPool = find(vlanPoolList.data, (item) => {
              return item.wifiNetworkIds?.includes(network.id)
            }) as BaseNetwork['vlanPool']
          })
        }

        return networksList
          ? { data: networksList as TableResult<Network> }
          : { error: networkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, NetworkUseCases.concat([
            'AddNetworkVenue',
            'DeleteNetworkVenue',
            'ActivateWifiNetworkOnVenue',
            'DeactivateWifiNetworkOnVenue'
          ]), () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    // WARNING: This query is deprecated due to performance issues. Please do not use.
    dashboardV2Overview: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(CommonUrlsInfo.getDashboardV2Overview, params),
          body: payload
        }
      },
      providesTags: [{ type: 'Network', id: 'Overview' }]
    }),
    alarmSummaries: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(CommonUrlsInfo.getAlarmSummaries, params),
          body: payload
        }
      },
      providesTags: [{ type: 'Network', id: 'Overview' }]
    }),
    venueSummaries: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(CommonUrlsInfo.getVenueSummaries, params),
          body: payload
        }
      }
    }),
    deviceSummaries: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(CommonUrlsInfo.getDeviceSummaries, params),
          body: payload
        }
      }
    }),
    clientSummaries: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(CommonUrlsInfo.getClientSummaries, params),
          body: payload
        }
      }
    }),
    externalProviders: build.query<ExternalProviders, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const externalProvidersReq = createHttpRequest(urlsInfo.getExternalProviders, params, apiCustomHeader)
        return {
          ...externalProvidersReq
        }
      },
      transformResponse: (response: ExternalWifiProviders, _meta, arg) => {
        if(arg.enableRbac) {
          return { providers: response.wisprProviders } as ExternalProviders
        }
        return response as ExternalProviders
      }
    }),
    getCertificateTemplateNetworkBinding: build.query<TableResult<CertificateTemplate>, RequestPayload> ({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.queryCertificateTemplate, params)
        return {
          ...req
        }
      }
    }),
    getMacRegistrationPoolNetworkBinding: build.query<TableResult<MacRegistrationPool>, RequestPayload> ({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.queryMacRegistrationPool, params)
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<MacRegistrationPool>) {
        return transferToTableResult<MacRegistrationPool>(result)
      }
    }),
    activateCertificateTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.activateCertificateTemplate, params)
        return {
          ...req
        }
      }
    }),
    activateCertificateTemplates: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.activateCertificateTemplates, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    activateDpskService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.activateDpskService, params)
        return {
          ...req
        }
      }
    }),
    getDpskService: build.query<DpskSaveData, RequestPayload> ({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.queryDpskService, params)
        return {
          ...req
        }
      },
      transformResponse: (response: TableResult<DpskSaveData>) => {
        return response?.data[0]
      }
    }),
    activateMacRegistrationPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.activateMacRegistrationPool, params)
        return {
          ...req
        }
      }
    }),
    activateVlanPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const headers = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiUrlsInfo.activateVlanPool, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      extraOptions: { maxRetries: 5 },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }),
    deactivateVlanPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const headers = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiUrlsInfo.deactivateVlanPool, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      extraOptions: { maxRetries: 5 },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
          })
        })
      }
    }
    ),
    activateRadiusServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.activateRadiusServer, params)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }, { type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    deactivateRadiusServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.deactivateRadiusServer, params)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }, { type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    updateRadiusServerSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.updateRadiusServerSettings, params),
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }, { type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    getRadiusServerSettings: build.query<NetworkRadiusSettings, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiRbacUrlsInfo.getRadiusServerSettings, params)
        }
      },
      providesTags: [{ type: 'NetworkRadiusServer', id: 'DETAIL' }]
    }),
    bindClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.bindClientIsolation, params)
        return {
          ...req
        }
      }
    }),
    unbindClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.unbindClientIsolation, params)
        return {
          ...req
        }
      }
    }),
    activateVenueApGroup: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        WifiRbacUrlsInfo.activateVenueApGroup,
        WifiRbacUrlsInfo.activateVenueApGroup
      ),
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    deactivateVenueApGroup: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        WifiRbacUrlsInfo.deactivateVenueApGroup,
        WifiRbacUrlsInfo.deactivateVenueApGroup
      ),
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    updateVenueApGroup: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        WifiRbacUrlsInfo.updateVenueApGroups,
        WifiRbacUrlsInfo.updateVenueApGroups
      ),
      invalidatesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    venueWifiRadioActiveNetworks: build.query<Network[], RequestPayload & { radio: RadioTypeEnum }>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, arg.params, apiCustomHeader)
        const wifiNetworksReq = {
          ...networkListReq,
          body: JSON.stringify(arg.payload)
        }

        const wifiNetworksQuery = await fetchWithBQ(wifiNetworksReq) as { data: { data: (Network & { venueApGroups: NetworkVenue[] })[] } }
        const networkIds = wifiNetworksQuery.data.data.map((network) => network.id)
        const networksQueryResults = await Promise.all(networkIds.map(async (id) => {
          if (id) {
            const networksQuery = await fetchWithBQ({
              ...createHttpRequest(WifiRbacUrlsInfo.getNetworkVenue, { ...arg.params, networkId: id })
            }) as { data: { data: NetworkVenue[] } }
            return {
              ...networksQuery.data,
              networkId: id
            }
          }
          return { data: { data: [] }, networkId: '' }
        })) as { data: { data: NetworkVenue[] }, networkId: string }[]
        const filteredNetworks = networksQueryResults.filter(network => Object.keys(network).length > 1) as unknown as NetworkVenue[]

        const active = filteredNetworks.reduce(
          (active: Record<string, boolean>, network: NetworkVenue) => {
            if (network.allApGroupsRadioTypes?.includes(arg.radio)) {
              active[network.networkId as string] = true
            }
            return active
          },
          {} as Record<string, boolean>
        )

        return {
          data: wifiNetworksQuery.data.data.filter(network => active[network.id as string])
        }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    bindingPersonaGroupWithNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const headers = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.bindingPersonaGroupWithNetwork, params, headers)
        return {
          ...req
        }
      }
    }),
    bindingSpecificIdentityPersonaGroupWithNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const headers = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.bindingSpecificIdentityPersonaGroupWithNetwork, params, headers)
        return {
          ...req
        }
      }
    })
  })
})

const calculateNetworkActivated = (res?: NetworkVenue) => {
  const activatedObj = { isActivated: false, isDisabled: false, errors: [] as string[] }
  let errorsCounter = 0
  if (res && !res.isAllApGroups) {
    if (res.apGroups && res.apGroups.length) {
      res.apGroups.forEach(group => {
        if (group.id) {
          activatedObj.isActivated = true
        }
        if (group.validationError) {
          ++errorsCounter
          if (group.validationErrorReachedMaxConnectedNetworksLimit) {
            activatedObj.errors.push('validationErrorReachedMaxConnectedNetworksLimit')
          }
          if (group.validationErrorSsidAlreadyActivated) {
            activatedObj.errors.push('validationErrorSsidAlreadyActivated')
          }
          if (group.validationErrorReachedMaxConnectedCaptiveNetworksLimit) {
            activatedObj.errors.push('validationErrorReachedMaxConnectedCaptiveNetworksLimit')
          }
        }
      })
      if (errorsCounter === res.apGroups.length) {
        activatedObj.isDisabled = true
      }
    }
  } else if (res && res.isAllApGroups) {
    activatedObj.isActivated = true
  } else {
    activatedObj.isActivated = false
  }
  return activatedObj
}

export const aggregatedNetworksVenueData = (venueList: TableResult<Venue>,
  venueNetworkApGroupList:{ response: NetworkVenue[] },
  networkDeep?: NetworkDetail,
  venueIdsToIncompatible:{ [key:string]: number } = {}
) => {
  const data:Venue[] = []
  venueList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupList?.response?.find(
      i => i.venueId === item.id
    )
    const deepVenue = networkDeep?.venues?.find(
      i => i.venueId === item.id
    )
    data.push({
      ...item,
      activated: calculateNetworkActivated(networkApGroup),
      deepVenue: deepVenue,
      incompatible: venueIdsToIncompatible[item.id] ?? 0
    })
  })
  return {
    ...venueList,
    data
  }
}


// API V2
const apiV2CustomHeader = {
  'Content-Type': 'application/vnd.ruckus.v2+json',
  'Accept': 'application/vnd.ruckus.v2+json'
}

export const fetchNetworkVenueListV2 = async (arg:any, fetchWithBQ:any) => {
  const networkVenuesListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? ConfigTemplateUrlsInfo.getVenuesTemplateList
      : CommonUrlsInfo.getVenuesList
    , arg.params),
    body: arg.payload
  }
  const networkVenuesListQuery = await fetchWithBQ(networkVenuesListInfo)
  const networkVenuesList = networkVenuesListQuery.data as TableResult<Venue>
  const venueIds:string[] = networkVenuesList.data?.filter(v => {
    if (v.aggregatedApStatus) {
      return Object.values(v.aggregatedApStatus || {}).reduce((a, b) => a + b, 0) > 0
    }
    return false
  }).map(v => v.id) || []

  const networkDeepList = await getNetworkDeepList([arg.params?.networkId], fetchWithBQ, arg.payload.isTemplate, arg.payload.isTemplateRbacEnabled)
  const networkDeep = Array.isArray(networkDeepList?.response) ?
    networkDeepList?.response[0] : undefined
  let networkVenuesApGroupList = {} as { data: NetworkVenue[] }

  if (networkDeep?.wlan?.ssid && arg.params?.networkId) {
    const filters = networkVenuesList.data.map(item => ({
      venueId: item.id,
      networkId: arg.params?.networkId
    }))

    const networkVenuesApGroupInfo = {
      ...createHttpRequest(arg.payload.isTemplate
        ? (arg.payload.isTemplateRbacEnabled ? ConfigTemplateUrlsInfo.getNetworkTemplateListRbac : VenueConfigTemplateUrlsInfo.networkActivations)
        : CommonUrlsInfo.networkActivations, arg.params,
      arg.payload.isTemplate
        ? {}
        : apiV2CustomHeader),
      body: arg.payload.isTemplate ? (arg.payload.isTemplateRbacEnabled ? {
        deep: true,
        fields: [],
        filters: { id: filters.map(filter => filter.networkId) },
        sortField: 'name',
        sortOrder: 'ASC',
        page: 1,
        pageSize: 10_000
      } : { filters }) : JSON.stringify({ filters })
    }
    const networkVenuesApGroupQuery = await fetchWithBQ(networkVenuesApGroupInfo)
    networkVenuesApGroupList = networkVenuesApGroupQuery.data as { data: NetworkVenue[] }
  }

  return { networkVenuesListQuery, networkVenuesList, networkVenuesApGroupList, networkDeep, venueIds }

}

export const aggregatedNetworksVenueDataV2 = (venueList: TableResult<Venue>,
  venueNetworkApGroupList:{ data: NetworkVenue[] },
  networkDeep?: NetworkDetail,
  venueIdsToIncompatible:{ [key:string]: number } = {}
) => {
  const data:Venue[] = []
  const venueNetworkApGroupsData = venueNetworkApGroupList?.data
  venueList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupsData?.find(
      i => i.venueId === item.id
    )
    const deepVenue = networkDeep?.venues?.find(
      i => i.venueId === item.id
    )
    data.push({
      ...item,
      activated: calculateNetworkActivated(networkApGroup),
      deepVenue: deepVenue,
      incompatible: venueIdsToIncompatible[item.id] ?? 0
    })
  })
  return {
    ...venueList,
    data
  }
}

export const fetchVenueNetworkListV2 = async (arg: any, fetchWithBQ: any) => {
  const venueNetworkListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? ConfigTemplateUrlsInfo.getVenueNetworkTemplateList
      : CommonUrlsInfo.getVenueNetworkList, arg.params),
    body: arg.payload
  }

  const venueNetworkListQuery = await fetchWithBQ(venueNetworkListInfo)
  const networkList = venueNetworkListQuery.data as TableResult<Network>

  let venueNetworkApGroupList = {} as { data: NetworkVenue[] }
  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds = networkList?.data?.map(item => item.id) || []

  if (networkIds.length > 0) {
    const filters = networkList.data.map(item => ({
      networkId: item.id,
      venueId: arg.params?.venueId
    }))

    const venueNetworkApGroupInfo = {
      ...createHttpRequest(arg.payload.isTemplate
        ? (arg.payload.isTemplateRbacEnabled ? ConfigTemplateUrlsInfo.getNetworkTemplateListRbac : VenueConfigTemplateUrlsInfo.networkActivations)
        : CommonUrlsInfo.networkActivations, arg.params,
      arg.payload.isTemplate
        ? {}
        : apiV2CustomHeader),
      body: arg.payload.isTemplate ? (arg.payload.isTemplateRbacEnabled ? {
        deep: true,
        fields: [],
        filters: { id: filters.map(filter => filter.networkId) },
        sortField: 'name',
        sortOrder: 'ASC',
        page: 1,
        pageSize: 10_000
      } : { filters }) : JSON.stringify({ filters })
    }
    const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
    venueNetworkApGroupList = venueNetworkApGroupQuery.data as { data: NetworkVenue[] }
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, arg.payload.isTemplate, arg.payload.isTemplateRbacEnabled)
  }
  return { venueNetworkListQuery,
    networkList,
    venueNetworkApGroupList,
    networkDeepListList,
    networkIds
  }
}

export const aggregatedVenueNetworksDataV2 = (networkList: TableResult<Network>,
  venueNetworkApGroupList:{ data: NetworkVenue[] },
  networkDeepListList:{ response: NetworkDetail[] },
  apCompatibilities:{ [key:string]: number } = {}) => {
  const data:Network[] = []
  const venueNetworkApGroupsData = venueNetworkApGroupList?.data
  networkList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupsData?.find(
      i => i.networkId === item.id
    )
    const deepNetwork = networkDeepListList?.response?.find(
      i => i.id === item.id
    )

    if (item?.dsaeOnboardNetwork) {
      item = { ...item,
        ...{ children: [{ ...item?.dsaeOnboardNetwork,
          isOnBoarded: true,
          activated: calculateNetworkActivated(networkApGroup) } as Network] }
      }
    }

    data.push({
      ...item,
      activated: calculateNetworkActivated(networkApGroup),
      deepNetwork: deepNetwork,
      incompatible: apCompatibilities[item.id] ?? 0
    })
  })

  return {
    ...networkList,
    data
  }
}

export const fetchApGroupNetworkVenueListV2 = async (arg:any, fetchWithBQ:any) => {
  const apGroupNetworkListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? VenueConfigTemplateUrlsInfo.getApGroupNetworkList
      : CommonUrlsInfo.getApGroupNetworkList, arg.params),
    body: arg.payload
  }

  const apGroupNetworkListQuery = await fetchWithBQ(apGroupNetworkListInfo)
  const networkList = apGroupNetworkListQuery.data as TableResult<Network>
  let venueNetworkApGroupList = {} as { data: NetworkVenue[] }
  let networkDeepListList = {} as { response: NetworkDetail[] }

  if (networkList && networkList.data.length > 0) {
    const filters = networkList.data.map(item => ({
      networkId: item.id,
      venueId: arg.params?.venueId
    }))
    const networkIds = networkList.data.map(item => item.id)

    const venueNetworkApGroupInfo = {
      ...createHttpRequest(arg.payload.isTemplate
        ? (arg.payload.isTemplateRbacEnabled ? ConfigTemplateUrlsInfo.getNetworkTemplateListRbac : VenueConfigTemplateUrlsInfo.networkActivations)
        : CommonUrlsInfo.networkActivations, arg.params,
      arg.payload.isTemplate
        ? {}
        : apiV2CustomHeader),
      body: arg.payload.isTemplate ? (arg.payload.isTemplateRbacEnabled ? {
        deep: true,
        fields: [],
        filters: { id: filters.map(filter => filter.networkId) },
        sortField: 'name',
        sortOrder: 'ASC',
        page: 1,
        pageSize: 10_000
      } : { filters }) : JSON.stringify({ filters })
    }
    const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
    venueNetworkApGroupList = venueNetworkApGroupQuery.data as { data: NetworkVenue[] }

    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, arg.payload.isTemplate, arg.payload.isTemplateRbacEnabled)
  }

  return { apGroupNetworkListQuery,
    networkList,
    venueNetworkApGroupList,
    networkDeepListList
  }
}

export const {
  useNetworkListQuery,
  useLazyNetworkListQuery,
  useNetworkTableQuery,
  useWifiNetworkListQuery,
  useLazyWifiNetworkListQuery,
  useWifiNetworkTableQuery,
  useEnhanceWifiNetworkTableQuery,
  useGetNetworkQuery,
  useLazyGetNetworkQuery,
  useGetNetworkDeepQuery,
  useGetNetworkDeepV2Query,
  useNetworkDetailHeaderQuery,
  useNetworkVenueListV2Query,
  useNetworkVenueTableV2Query,
  useNewNetworkVenueTableQuery,
  useEnhanceNetworkVenueTableQuery,
  useEnhanceNetworkVenueTableV2Query,
  useVenueNetworkActivationsDataListQuery,
  useVenueNetworkActivationsViewModelListQuery,
  useAddNetworkMutation,
  useUpdateNetworkMutation,
  useDeleteNetworkMutation,
  useAddRbacNetworkVenueMutation,
  useAddNetworkVenueMutation,
  useAddNetworkVenuesMutation,
  useUpdateNetworkVenueMutation,
  useUpdateNetworkVenuesMutation,
  useDeleteRbacNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useDeleteNetworkVenuesMutation,
  useApNetworkListQuery,
  useGetRbacApNetworkListQuery,
  useVenueNetworkListV2Query,
  useNewVenueNetworkTableQuery,
  useEnhanceVenueNetworkTableQuery,
  useEnhanceVenueNetworkTableV2Query,
  useVenueRadioActiveNetworksQuery,
  useLazyVenueRadioActiveNetworksQuery,
  useVenueNetworkTableV2Query,
  useApGroupNetworkListV2Query,
  useLazyApGroupNetworkListV2Query,
  useNewApGroupNetworkListQuery,
  useLazyNewApGroupNetworkListQuery,
  useNewApGroupNetworkListV2Query,
  useLazyNewApGroupNetworkListV2Query,
  useGetApCompatibilitiesNetworkQuery,
  useLazyGetApCompatibilitiesNetworkQuery,
  useGetNetworkApCompatibilitiesQuery,
  useLazyGetNetworkApCompatibilitiesQuery,
  useDashboardV2OverviewQuery,
  useAlarmSummariesQuery,
  useVenueSummariesQuery,
  useDeviceSummariesQuery,
  useClientSummariesQuery,
  useExternalProvidersQuery,
  useGetCertificateTemplateNetworkBindingQuery,
  useGetMacRegistrationPoolNetworkBindingQuery,
  useActivateCertificateTemplateMutation,
  useActivateCertificateTemplatesMutation,
  useActivateDpskServiceMutation,
  useGetDpskServiceQuery,
  useActivateMacRegistrationPoolMutation,
  useActivateVlanPoolMutation,
  useDeactivateVlanPoolMutation,
  useActivateRadiusServerMutation,
  useDeactivateRadiusServerMutation,
  useUpdateRadiusServerSettingsMutation,
  useGetRadiusServerSettingsQuery,
  useBindClientIsolationMutation,
  useUnbindClientIsolationMutation,
  useActivateVenueApGroupMutation,
  useDeactivateVenueApGroupMutation,
  useUpdateVenueApGroupMutation,
  useVenueWifiRadioActiveNetworksQuery,
  useLazyVenueWifiRadioActiveNetworksQuery,
  useBindingPersonaGroupWithNetworkMutation,
  useBindingSpecificIdentityPersonaGroupWithNetworkMutation
} = networkApi

export const aggregatedNetworkCompatibilitiesData = (networkList: TableResult<Network>,
  apCompatibilities: { [key:string]: number }) => {
  networkList.data = networkList.data.map(item => ({
    ...transformNetwork(item),
    incompatible: apCompatibilities[item.id]
  }))
  return networkList
}

export const aggregatedWifiNetworkCompatibilitiesData = (networkList: TableResult<WifiNetwork>,
  apCompatibilities: { [key:string]: number }) => {
  networkList.data = networkList.data.map(item => ({
    ...transformWifiNetwork(item),
    incompatible: apCompatibilities[item.id]
  }))
  return networkList
}

export { baseNetworkApi }

