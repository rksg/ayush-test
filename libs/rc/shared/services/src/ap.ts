/* eslint-disable max-len */
import { QueryReturnValue, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { reduce, uniq }                                                         from 'lodash'

import { Filter }             from '@acx-ui/components'
import {
  AFCInfo,
  AFCPowerMode,
  AFCStatus,
  AP,
  APExtended,
  APMeshSettings,
  APNetworkSettings,
  APPhoto,
  AddApGroup,
  ApAntennaTypeSettings,
  ApBandModeSettings,
  ApBandModeSettingsV1Dot1,
  ApBssColoringSettings,
  ApSmartMonitor,
  ApIot,
  ApClientAdmissionControl,
  ApDeep,
  ApDetailHeader,
  ApDetails,
  ApDirectedMulticast,
  ApExtraParams,
  ApFeatureSet,
  ApGroup,
  ApGroupViewModel,
  ApLedSettings,
  ApUsbSettings,
  ApLldpNeighborsResponse,
  ApManagementVlan,
  ApNeighborsResponse,
  ApPosition,
  ApRadioCustomization,
  ApRadioCustomizationV1Dot1,
  ApRfNeighborsResponse,
  ApViewModel,
  ApiVersionEnum,
  Capabilities,
  CapabilitiesApModel,
  CommonRbacUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  DHCPSaveData,
  DHCPUrls,
  DhcpAp,
  DhcpApInfo,
  DhcpModeEnum,
  GetApiVersionHeader,
  GetUploadFormDataApiVersionHeader,
  ImportErrorRes,
  MdnsProxyUrls,
  MeshUplinkAp,
  NewAPExtendedGrouped,
  NewAPModel,
  NewAPModelExtended,
  NewDhcpAp,
  NewMdnsProxyData,
  NewPacketCaptureState,
  PacketCaptureOperationResponse,
  PacketCaptureState,
  PingAp,
  RequestFormData,
  SEARCH,
  SORTER,
  SupportCcdApGroup,
  SupportCcdVenue,
  TableResult,
  Venue,
  VenueDefaultApGroup,
  VenueDefaultRegulatoryChannels,
  WifiApSetting,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  downloadFile,
  onActivityMessageReceived,
  onSocketActivityChanged,
  NewApGroupViewModelResponseType,
  EthernetPortProfileUrls,
  SystemCommands,
  StickyClientSteering,
  ApStickyClientSteering,
  SwitchRbacUrlsInfo,
  SwitchClient,
  SwitchInformation,
  FeatureSetResponse,
  CompatibilityResponse,
  EthernetPortProfileViewData,
  SoftGreUrls,
  SoftGreViewData,
  ClientIsolationUrls,
  ClientIsolationViewModel,
  LanPortsUrls,
  APLanPortSettings,
  mergeLanPortSettings,
  IpsecUrls,
  IpsecViewData,
  ApGroupRadioCustomization,
  ApGroupApModelBandModeSettings,
  ApGroupDefaultRegulatoryChannels,
  ApExternalAntennaSettings
} from '@acx-ui/rc/utils'
import { baseApApi } from '@acx-ui/store'
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { MaybePromise, RequestPayload } from '@acx-ui/types'
import {
  ApiInfo,
  batchApi,
  createHttpRequest,
  getEnabledDialogImproved,
  ignoreErrorModal
} from '@acx-ui/utils'


import {
  addApGroupFn,
  getApGroupFn,
  getApGroupsListFn,
  updateApGroupFn
} from './apGroupUtils'
import {
  aggregateApGroupInfo,
  aggregatePoePortInfo,
  aggregateSwitchInfo,
  aggregateVenueInfo,
  findTargetLanPorts,
  getApListFn,
  getApViewmodelListFn,
  transformApListFromNewModel,
  transformGroupByListFromNewModel
} from './apUtils'


export type ApsExportPayload = {
  filters: Filter
  tenantId: string
} & SEARCH & SORTER

interface ApRequestPayload extends SORTER {
  filters: Filter
  groupBy: unknown
  groupByFields: unknown
  fields: unknown
  page: number
  pageSize: number
}

export const apApi = baseApApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<TableResult<APExtended, ApExtraParams>, RequestPayload>({
      queryFn: async (args, _queryApi, _extraOptions, fetchWithBQ) => {
        return await getApListFn(args, fetchWithBQ)
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Ap', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddAp',
            'AddAps',
            'UpdateAp',
            'DeleteAp',
            'DeleteAps',
            'AddApGroup',
            'AddApGroupLegacy'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    apViewModel: build.query<ApViewModel, RequestPayload>({
      queryFn: async (args, _queryApi, _extraOptions, fetchWithBQ) => {
        return await getApViewmodelListFn(args, fetchWithBQ)
      }
    }),
    // for AP Table
    newApList: build.query<TableResult<NewAPModelExtended|NewAPExtendedGrouped, ApExtraParams>,
    RequestPayload>({
      queryFn: async ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const groupByField = (payload as ApRequestPayload)?.groupBy
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const apsReq = createHttpRequest(CommonRbacUrlsInfo.getApsList, params, apiCustomHeader)
        const apListRes = await fetchWithBQ({ ...apsReq, body: JSON.stringify(payload) })
        let apList
        let venueIds
        let groupIds
        let apGroupList
        if (groupByField) {
          apList = apListRes.data as TableResult<NewAPExtendedGrouped, ApExtraParams>
          venueIds = apList?.data.flatMap(item => item.aps.map(item => item.venueId))
          groupIds = groupByField === 'apGroupId' ?
            apList?.data.flatMap(item => item.groupedValue || item.aps.map(item => item.apGroupId)) :
            apList?.data.flatMap(item => item.aps.map(item => item.apGroupId))
        } else {
          apList = apListRes.data as TableResult<NewAPModelExtended, ApExtraParams>
          venueIds = apList?.data.map(item => item.venueId).filter(item => item)
          groupIds = apList?.data.map(item => item.apGroupId).filter(item => item)
        }
        if (venueIds.length > 0) {
          const venuePayload = {
            fields: ['name', 'id'],
            pageSize: 10000,
            filters: { id: venueIds }
          }
          const venueListRes = await fetchWithBQ({ ...createHttpRequest(CommonUrlsInfo.getVenuesList), body: venuePayload })
          const venueList = venueListRes.data as TableResult<Venue>
          aggregateVenueInfo(apList, venueList)
        }
        if (groupIds.length > 0) {
          const apGroupPayload = {
            fields: ['name', 'id', 'wifiNetworkIds'],
            pageSize: 10000,
            filters: { id: groupIds }
          }
          const apGroupListRes = await fetchWithBQ({
            ...createHttpRequest(WifiRbacUrlsInfo.getApGroupsList),
            body: JSON.stringify(apGroupPayload)
          })
          apGroupList = apGroupListRes.data as TableResult<NewApGroupViewModelResponseType>
          aggregateApGroupInfo(apList, apGroupList)
        }

        if (apList && apList.data.length > 0) {
          const apMacSwitchMap = new Map<string, SwitchInformation>()
          const unqueClientApMacs: Set<string> = new Set()
          apList?.data.forEach((item) => {
            const { macAddress } = item
            if (macAddress) {
              unqueClientApMacs.add(macAddress)
            }
          })
          const switchClientMacs: string[] = Array.from(unqueClientApMacs)
          const switchApiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          const switchClientPayload = {
            fields: ['clientMac', 'switchId', 'switchName', 'switchSerialNumber'],
            page: 1,
            pageSize: 10000,
            filters: { clientMac: switchClientMacs }
          }
          const switchClistInfo = {
            ...createHttpRequest(SwitchRbacUrlsInfo.getSwitchClientList, {}, switchApiCustomHeader),
            body: JSON.stringify(switchClientPayload)
          }
          const switchClientsQuery = await fetchWithBQ(switchClistInfo)
          const switchClients = switchClientsQuery.data as TableResult<SwitchClient>

          switchClients?.data?.forEach((switchInfo) => {
            const { clientMac, switchId, switchName, switchSerialNumber } = switchInfo
            apMacSwitchMap.set(clientMac, {
              id: switchId,
              name: switchName,
              serialNumber: switchSerialNumber
            })
          })

          aggregateSwitchInfo(apList, apMacSwitchMap)
        }


        const capabilitiesRes = await fetchWithBQ(createHttpRequest(WifiRbacUrlsInfo.getWifiCapabilities, apiCustomHeader))
        const capabilities = capabilitiesRes.data as Capabilities
        aggregatePoePortInfo(apList, capabilities)
        if(groupByField) {
          return {
            data: transformGroupByListFromNewModel(
              apList as TableResult<NewAPExtendedGrouped, ApExtraParams>,
              apGroupList
            )
          }
        }
        return { data: transformApListFromNewModel(apList as TableResult<NewAPModelExtended, ApExtraParams>) }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Ap', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddAp',
            'AddAps',
            'UpdateAp',
            'DeleteAp',
            'DeleteAps',
            'AddApGroup',
            'DeleteApGroup',
            'AddApGroupLegacy',
            'ImportVenueApsCsv'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // deprecated: use getApGroupsList as replacement
    apGroupListByVenue: build.query<ApGroup[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApGroupListByVenue, params)
        return {
          ...req
        }
      }
    }),
    apGroupsList: build.query<TableResult<ApGroupViewModel>, RequestPayload>({
      queryFn: getApGroupsListFn(),
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'ApGroup', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddApGroup',
            'UpdateApGroup',
            'DeleteApGroup',
            'AddApGroupLegacy'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'ApGroup', id: 'LIST' }]))
          })
        })
      }
    }),
    getApGroup: build.query<ApGroup, RequestPayload>({
      queryFn: getApGroupFn(),
      providesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    addApGroup: build.mutation<AddApGroup, RequestPayload>({
      queryFn: addApGroupFn(),
      invalidatesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    updateApGroup: build.mutation<AddApGroup, RequestPayload>({
      queryFn: updateApGroupFn(),
      invalidatesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    deleteApGroup: build.mutation<ApGroup, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.deleteApGroup, params, customHeaders)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    // no longer supported after RBAC
    deleteApGroups: build.mutation<ApGroup[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteApGroups, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    // TODO: no longer supported after v1, use getApGroupsList as replacement
    venueDefaultApGroup: build.query<VenueDefaultApGroup[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueDefaultApGroup, params)
        return {
          ...req
        }
      },
      transformResponse (result: VenueDefaultApGroup) {
        return Array.isArray(result) ? result : [result]
      }
    }),
    addAp: build.mutation<ApDeep, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.addAp, params, {
          ...(getEnabledDialogImproved() ? {} : ignoreErrorModal),
          ...apiCustomHeader
        })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    moveApToTargetApGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.moveApToTargetApGroup, params, apiCustomHeader)
        return req
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    importAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const apiCustomHeader = GetUploadFormDataApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(
          enableRbac ? WifiRbacUrlsInfo.addApWithDefaultGroup : WifiUrlsInfo.addAp,
          params,
          apiCustomHeader
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response && (msg.useCase === 'ImportApsCsv' || msg.useCase === 'ImportVenueApsCsv')
              && ((msg.steps?.find((step) => {
                return step.id === 'PostProcessedImportAps'
              })?.status !== 'IN_PROGRESS'))) {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    importResult: build.query<ImportErrorRes, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const { requestId } = payload as { requestId: string }
        const api: ApiInfo = { ...urlsInfo.getImportResult }
        api.url += `?${enableRbac ? 'operationRequestId' : 'requestId'}=${requestId}`
        const req = createHttpRequest(api, params, apiCustomHeader)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0
    }),
    getAp: build.query<ApDeep, RequestPayload>({
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        if (!enableRbac) {
          const req = createHttpRequest(WifiUrlsInfo.getAp, params)
          const res = await fetchWithBQ({ ...req })
          return { data: res.data as ApDeep }
        }
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const getApReq = createHttpRequest(WifiRbacUrlsInfo.getAp, params, apiCustomHeader)
        const getApRes = await fetchWithBQ({ ...getApReq })
        const apData = getApRes.data as ApDeep
        if(apData) {
          apData.serialNumber = params?.serialNumber ?? ''
          apData.venueId = params?.venueId ?? ''
          const mDnsProxyPayload = {
            fields: ['name', 'activations', 'rules', 'id'],
            filters: {
              'activations.apSerialNumbers': [params?.serialNumber]
            }
          }
          const mDnsProxyListReq = createHttpRequest(MdnsProxyUrls.queryMdnsProxy, undefined, apiCustomHeader)
          const mDnsProxyListRes = await fetchWithBQ({ ...mDnsProxyListReq, body: JSON.stringify(mDnsProxyPayload) })
          const mDnsProxyList = (mDnsProxyListRes.data as TableResult<NewMdnsProxyData>).data
          const targetMdnsData = mDnsProxyList?.[0]
          if (targetMdnsData) {
            apData.multicastDnsProxyServiceProfileId = targetMdnsData.id
          }
        }
        return { data: apData }
      },
      providesTags: [{ type: 'Ap', id: 'Details' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateAp',
            'UpdateApCustomization',
            'ResetApCustomization',
            'ActivateMulticastDnsProxyProfile',
            'DeactivateMulticastDnsProxyProfile'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'Details' }]))
          })
        })
      }
    }),
    getApOperational: build.query<ApDeep, RequestPayload>({
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        if(!enableRbac) {
          const req = createHttpRequest(WifiUrlsInfo.getApOperational, params)
          const res = await fetchWithBQ({ ...req })
          return { data: res.data as ApDeep }
        }
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const apReq = createHttpRequest(WifiRbacUrlsInfo.getApOperational, params, apiCustomHeader)
        const apRes = await fetchWithBQ({ ...apReq })
        const ap = apRes.data as ApDeep
        if(ap) {
          ap.serialNumber = params?.serialNumber ?? ''
          ap.venueId = params?.venueId ?? ''

          // get AP group ID from the AP list data from the view model
          const apListQueryPayload = {
            fields: ['name', 'serialNumber', 'apGroupId'],
            pageSize: 1,
            filters: { serialNumber: [ap.serialNumber] }
          }
          const apListQuery = await fetchWithBQ({
            ...createHttpRequest(CommonRbacUrlsInfo.getApsList, params),
            body: JSON.stringify(apListQueryPayload)
          })
          const aps = apListQuery.data as TableResult<NewAPModel>
          if(aps?.data) {
            ap.apGroupId = aps.data[0].apGroupId
          }
        }
        return { data: ap }
      },
      providesTags: [{ type: 'Ap', id: 'Details' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateAp',
            'UpdateApCustomization',
            'ResetApCustomization'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'Details' }]))
          })
        })
      }
    }),
    updateAp: build.mutation<ApDeep, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateAp, params, {
          ...apiCustomHeader,
          ...(getEnabledDialogImproved() ? {} : ignoreErrorModal)
        })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }, { type: 'Ap', id: 'Details' }]
    }),
    deleteAp: build.mutation<AP, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        let api
        if (enableRbac) {
          api = WifiRbacUrlsInfo.deleteAp
        } else {
          api = !!payload ? WifiUrlsInfo.deleteAps : WifiUrlsInfo.deleteAp
        }
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(api, params, apiCustomHeader)
        return {
          ...req,
          ...(!enableRbac && !!payload && { body: payload })
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    wifiCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getWifiCapabilities, params, apiCustomHeader)
        return {
          ...req
        }
      }
    }),
    deleteSoloAp: build.mutation<AP, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        let api
        if (enableRbac) {
          api = WifiRbacUrlsInfo.deleteSoloAp
        } else {
          api = !!payload ? WifiUrlsInfo.deleteSoloAps : WifiUrlsInfo.deleteSoloAp
        }
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(api, params, apiCustomHeader)
        return {
          ...req,
          ...(!enableRbac && !!payload && { body: payload })
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    getDhcpAp: build.query<DhcpAp, RequestPayload>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        if (!enableRbac) {
          const req = createHttpRequest(WifiUrlsInfo.getDhcpAp, params)
          const res = await fetchWithBQ({ ...req, body: payload })
          return { data: res.data as DhcpAp }
        }

        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const newPayload = payload as { venueId: string, serialNumber: string }[]
        const venueIds = uniq(newPayload.map(item => item.venueId))

        const venueDhcpMap = await getVenueDhcpRelation(newPayload, fetchWithBQ)
        const result = [] as DhcpApInfo[]
        const cacheDhcpProfileData: { [dhcpId: string]: DHCPSaveData } = {}

        const venueDhcpApsReq = createHttpRequest(WifiRbacUrlsInfo.getDhcpAps, undefined, customHeaders)
        const venueDhcpApsRes = await fetchWithBQ({
          ...venueDhcpApsReq,
          body: JSON.stringify({ venueIds })
        })
        const venueDhcpApsData = ((venueDhcpApsRes?.data) ?? { data: [] }) as { data: NewDhcpAp[] }
        const venueDhcpAps = (venueDhcpApsData.data ?? []) as NewDhcpAp[]

        for (let item of newPayload) {
          const { venueId, serialNumber } = item
          const dhcpAp = venueDhcpAps.find( ap => ap.serialNumber === serialNumber)
          if (!dhcpAp) continue

          const dhcpId = venueDhcpMap[venueId]
          await setDhcpProfileToCache(cacheDhcpProfileData, fetchWithBQ, dhcpId)
          result.push({
            ...dhcpAp,
            venueDhcpEnabled: Boolean(dhcpId),
            venueDhcpMode: cacheDhcpProfileData[dhcpId ?? '']?.dhcpMode as unknown as DhcpModeEnum
          })
        }
        return { data: result }
      }
    }),
    downloadApLog: build.mutation<{ fileURL: string, fileUrl: string }, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.downloadApLog, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    apDetailHeader: build.query<ApDetailHeader, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApDetailHeader, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'DETAIL' }]
    }),
    apDetails: build.query<ApDetails, RequestPayload>({
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const apDetailReq = createHttpRequest(urlsInfo.getAp, params, apiCustomHeader)
        const apDetailRes = await fetchWithBQ({ ...apDetailReq })
        const apDetail = apDetailRes.data as ApDetails
        if (!enableRbac) {
          return { data: apDetail }
        }

        const apListPayload = {
          fields: ['floorplanId'],
          filters: {
            serialNumber: [params?.serialNumber]
          }
        }
        const apListReq = createHttpRequest(CommonRbacUrlsInfo.getApsList, params, apiCustomHeader)
        const apListRes = await fetchWithBQ({ ...apListReq, body: JSON.stringify(apListPayload as Object) })
        const apList = apListRes.data as TableResult<NewAPModel>
        const floorplanId = apList.data[0]?.floorplanId
        let floorplan = {} as ApPosition
        if (floorplanId) {
          const floorplanReq = createHttpRequest(
            CommonRbacUrlsInfo.GetApPosition,
            { ...params, floorplanId },
            apiCustomHeader
          )
          const floorplanRes = await fetchWithBQ(floorplanReq)
          floorplan = floorplanRes.data as ApPosition
        }
        return {
          data: {
            ...apDetail,
            venueId: params?.venueId,
            ...(
              floorplanId ? {
                position: {
                  ...floorplan,
                  floorplanId
                }
              } : {}
            )
          } as ApDetails
        }
      }
    }),
    rebootAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.rebootAp, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    factoryResetAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.factoryResetAp, params, apiCustomHeader)
        if (enableRbac) {
          return {
            ...req,
            body: JSON.stringify({
              type: SystemCommands.FACTORY_RESET
            })
          }
        } else {
          return {
            ...req
          }
        }
      }
    }),
    blinkLedAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.blinkLedAp, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    pingAp: build.mutation<PingAp, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.pingAp, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    traceRouteAp: build.mutation<PingAp, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.traceRouteAp, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getApRadioCustomization: build.query<ApRadioCustomization, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApRadioCustomization, params, apiCustomHeader)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'RADIO' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApRadioCustomization'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'RADIO' }]))
          })
        })
      }
    }),
    getApGroupRadioCustomization: build.query<ApGroupRadioCustomization, RequestPayload>({
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo

        const req = createHttpRequest(urlsInfo.getApGroupRadioCustomization, params)
        const response = await fetchWithBQ(req)

        if (response.error) {
          return { error: response.error }
        }

        const responseData = response.data as ApGroupRadioCustomization

        return {
          data: {
            radioParams24G: responseData.radioParams24G,
            radioParams50G: responseData.radioParams50G,
            radioParams60G: responseData.radioParams6G,
            radioParamsDual5G: responseData.radioParamsDual5G
          } as ApGroupRadioCustomization
        }
      },
      providesTags: [{ type: 'ApGroup', id: 'RADIO' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApGroupRadioSettings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'ApGroup', id: 'RADIO' }]))
          })
        })
      }
    }),
    updateApRadioCustomization: build.mutation<ApRadioCustomization, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApRadioCustomization, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'RADIO' }]
    }),
    getApRadioCustomizationV1Dot1: build.query<ApRadioCustomizationV1Dot1, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.getApRadioCustomizationV1Dot1, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'RADIO' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApRadioSettingsV1_1'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'RADIO' }]))
          })
        })
      }
    }),
    updateApRadioCustomizationV1Dot1: build.mutation<ApRadioCustomizationV1Dot1, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApRadioCustomizationV1Dot1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'RADIO' }]
    }),
    updateApGroupRadioCustomization: build.mutation<ApGroupRadioCustomization, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const req = createHttpRequest(urlsInfo.updateApGroupRadioCustomization, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'ApGroup', id: 'RADIO' }]
    }),
    getApGroupDefaultRegulatoryChannels: build.query<ApGroupDefaultRegulatoryChannels, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.getApGroupDefaultRegulatoryChannels, params)
        return {
          ...req
        }
      }
    }),
    getApGroupApCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.getApGroupApCapabilities, params)
        return {
          ...req
        }
      }
    }),
    getApCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params }) => { // non RBAC API
        const req = createHttpRequest(WifiUrlsInfo.getApCapabilities, params)
        return {
          ...req
        }
      }
    }),
    getApGroupApModelBandModeSettings: build.query<ApGroupApModelBandModeSettings, RequestPayload<void>>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        return createHttpRequest(WifiRbacUrlsInfo.getApGroupBandModeSettings, params, apiCustomHeader)
      },
      providesTags: [{ type: 'ApGroup', id: 'BandModeSettings' }]
    }),
    updateApGroupApModelBandModeSettings: build.mutation<CommonResult, RequestPayload<ApGroupApModelBandModeSettings>>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApGroupBandModeSettings, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'ApGroup', id: 'BandModeSettings' }]
    }),
    getOldApCapabilitiesByModel: build.query<CapabilitiesApModel, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) { // non RBAC API
        const { params } = arg
        let modelName = arg.modelName
        const apCapReq = createHttpRequest(WifiUrlsInfo.getApCapabilities, params)
        const apCapQuery = await fetchWithBQ(apCapReq)
        const apCaps = apCapQuery.data as Capabilities

        if (!modelName) {
          const apReq = createHttpRequest(WifiUrlsInfo.getAp, params)
          const apQuery = await fetchWithBQ(apReq)
          const apData = apQuery.data as ApDetails
          modelName = apData.model
        }
        const curApCap = (apCaps?.apModels?.find(cap => cap.model === modelName) ?? {}) as CapabilitiesApModel

        return apCapQuery.data
          ? { data: curApCap }
          : { error: apCapQuery.error as FetchBaseQueryError }
      }
    }),
    getApCapabilitiesByModel: build.query<CapabilitiesApModel, RequestPayload>({
      query: ({ params }) => { // RBAC API
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getApCapabilities, params, apiCustomHeader)
        return {
          ...req
        }
      }
    }),
    getApPhoto: build.query<APPhoto, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { params, enableRbac } = arg
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = enableRbac ? {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...ignoreErrorModal
        } : undefined

        const apPhotoReq = createHttpRequest(urlsInfo.getApPhoto, params, apiCustomHeader)
        const apPhotoQuery = await fetchWithBQ(apPhotoReq)
        const data = (apPhotoQuery.data ?? {}) as APPhoto

        return data
          ? { data: data }
          : { error: apPhotoQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Ap', id: 'PHOTO' }],
      keepUnusedDataFor: 0
    }),
    addApPhoto: build.mutation<{}, RequestFormData>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetUploadFormDataApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.addApPhoto, params, apiCustomHeader)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'PHOTO' }]
    }),
    deleteApPhoto: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.deleteApPhoto, params, apiCustomHeader)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'PHOTO' }]
    }),
    getPacketCaptureState: build.query<PacketCaptureState, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getPacketCaptureState, params, customHeaders)
        return {
          ...req
        }
      },
      transformResponse (res, meta, requestArgs: RequestPayload) {
        if (!requestArgs.enableRbac) {
          return res as PacketCaptureState
        }
        const result = res as NewPacketCaptureState
        return {
          status: result.state,
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          sessionId: result.sessionId
        }
      }
    }),
    startPacketCapture: build.mutation<PacketCaptureOperationResponse, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.startPacketCapture, params, customHeaders)
        const reqPayload = enableRbac ? { ...(payload as Object), action: 'START' } : payload
        return {
          ...req,
          body: JSON.stringify(reqPayload)
        }
      }
    }),
    stopPacketCapture: build.mutation<PingAp, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.stopPacketCapture, params, customHeaders)
        const reqPayload = enableRbac ? { ...(payload as Object), action: 'STOP' } : payload
        return {
          ...req,
          body: JSON.stringify(reqPayload)
        }
      }
    }),
    getDefaultApLanPorts: build.query<WifiApSetting, RequestPayload>({
      query: ({ params }) => {
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getDefaultApLanPorts, params, apiCustomHeader)
        return {
          ...req
        }
      }
    }),
    getApLanPorts: build.query<WifiApSetting, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApLanPorts, params, apiCustomHeader)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'LanPorts' }]
    }),
    getApLanPortsWithActivatedProfiles: build.query<WifiApSetting | null, RequestPayload>({
      async queryFn ({
        params, enableRbac,
        enableEthernetProfile,
        enableSoftGreOnEthernet,
        enableClientIsolationOnEthernet,
        enableIpsecOverNetwork
      },
      _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.serialNumber) {
          return Promise.resolve({ data: null } as QueryReturnValue<
            null,
            FetchBaseQueryError,
            FetchBaseQueryMeta
          >)
        }
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const apLanPortSettings = await fetchWithBQ(
          createHttpRequest(urlsInfo.getApLanPorts, params, apiCustomHeader)
        )
        let apLanPorts = apLanPortSettings.data as WifiApSetting

        if (params?.serialNumber && !!apLanPorts?.lanPorts?.length) {
          const apLanPortSettingsQuery = apLanPorts?.lanPorts?.map((lanPort) => {
            return fetchWithBQ(createHttpRequest(LanPortsUrls.getApLanPortSettings,
              {
                venueId: params?.venueId,
                serialNumber: params.serialNumber,
                portId: lanPort.portId
              },
              apiCustomHeader
            ))
          })
          const reqs = await Promise.allSettled(apLanPortSettingsQuery!)
          const results: APLanPortSettings[] = reqs.map((result) => {
            return result.status === 'fulfilled' ? result.value.data as APLanPortSettings : {}
          })

          apLanPorts.lanPorts = mergeLanPortSettings(apLanPorts.lanPorts, results)
        }

        if (enableEthernetProfile) {
          const ethReq = {
            ...createHttpRequest(EthernetPortProfileUrls.getEthernetPortProfileViewDataList),
            body: JSON.stringify({
              fields: ['id', 'venueIds', 'venueActivations', 'apSerialNumbers', 'apActivations', 'vni'],
              pageSize: 1000
            })
          }

          const ethListQuery = await fetchWithBQ(ethReq)
          const ethList = ethListQuery.data as TableResult<EthernetPortProfileViewData>
          if (ethList.data && apLanPorts.lanPorts) {
            const apReq = createHttpRequest(urlsInfo.getAp, params)
            const apQuery = await fetchWithBQ(apReq)
            const apData = apQuery.data as ApDetails
            const apModel = apData.model
            const apActivateEths = ethList.data.filter(eth => eth.apSerialNumbers?.includes(params.serialNumber!)) ?? []
            const venueActivateEths = ethList.data.filter(eth => eth.venueIds?.includes(params.venueId!)) ?? []
            for (let eth of venueActivateEths) {
              const venuePorts = eth.venueActivations?.filter(
                v => v.venueId === params.venueId && v.apModel === apModel) ?? []
              for (let venuePort of venuePorts) {
                let venueTargetPort = apLanPorts.lanPorts?.find(l => l.portId === venuePort.portId?.toString())
                if (venueTargetPort) {
                  venueTargetPort.ethernetPortProfileId = eth.id
                }
              }
            }

            for (let eth of apActivateEths) {
              const ports = eth.apActivations?.filter(ap => ap.apSerialNumber === params.serialNumber) ?? []
              for (let port of ports) {
                let targetPort = apLanPorts.lanPorts
                  ?.find(l => l.portId === port.portId?.toString())
                if (targetPort) {
                  targetPort.ethernetPortProfileId = eth.id
                }
              }
            }
          }
        }

        if (enableSoftGreOnEthernet) {
          const softGreReq = {
            ...createHttpRequest(SoftGreUrls.getSoftGreViewDataList),
            body: JSON.stringify({
              filters: {
                'apActivations.apSerialNumber': [params.serialNumber]
              },
              pageSize: 1000
            })
          }

          const softGreListQuery = await fetchWithBQ(softGreReq)
          const softGreList = softGreListQuery.data as TableResult<SoftGreViewData>
          if (softGreList.data && apLanPorts.lanPorts) {
            for (let softGre of softGreList.data) {
              findTargetLanPorts(apLanPorts, softGre.apActivations, params.serialNumber).forEach(targetPort => {
                targetPort.softGreProfileId = softGre.id
              })
            }
          }
        }

        if (enableIpsecOverNetwork) {
          const ipsecReq = {
            ...createHttpRequest(IpsecUrls.getIpsecViewDataList),
            body: JSON.stringify({
              filters: {
                'apActivations.apSerialNumber': [params.serialNumber]
              },
              pageSize: 1000
            })
          }

          const ipsecListQuery = await fetchWithBQ(ipsecReq)
          const ipsecList = ipsecListQuery.data as TableResult<IpsecViewData>
          if (ipsecList.data && apLanPorts.lanPorts) {
            for (let ipsec of ipsecList.data) {
              findTargetLanPorts(apLanPorts, ipsec.apActivations, params.serialNumber).forEach(targetPort => {
                targetPort.ipsecProfileId = ipsec.id
                targetPort.ipsecEnabled = true
              })
            }
          }
        }

        if (enableClientIsolationOnEthernet) {
          const clientIsolationReq = {
            ...createHttpRequest(ClientIsolationUrls.queryClientIsolation),
            body: JSON.stringify({
              filters: {
                'apActivations.apSerialNumber': [params.serialNumber]
              },
              pageSize: 1000
            })
          }

          const clientIsolationListQuery = await fetchWithBQ(clientIsolationReq)
          const clientIsolationList = clientIsolationListQuery.data as TableResult<ClientIsolationViewModel>
          if (clientIsolationList.data && apLanPorts.lanPorts) {
            for (let clientIsolation of clientIsolationList.data) {
              findTargetLanPorts(apLanPorts, clientIsolation.apActivations, params.serialNumber).forEach(targetPort => {
                targetPort.clientIsolationProfileId = clientIsolation.id
              })
            }
          }
        }

        return apLanPortSettings.data
          ? { data: apLanPorts }
          : { error: apLanPortSettings.error } as QueryReturnValue<WifiApSetting,
            FetchBaseQueryError,
            FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Ap', id: 'LanPorts' }]
    }),

    updateApLanPorts: build.mutation<WifiApSetting, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApLanPorts, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Details' }, { type: 'Ap', id: 'LanPorts' }]
    }),
    updateApEthernetPorts: build.mutation<CommonResult, RequestPayload>({
      queryFn: async ({ params, payload, useVenueSettings }, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
          const apSettings = payload as WifiApSetting
          const activateRequests = apSettings?.lanPorts
            ?.filter(l => l.ethernetPortProfileId ).map(l => ({
              params: {
                venueId: params!.venueId,
                serialNumber: params!.serialNumber,
                portId: l.portId,
                id: l.ethernetPortProfileId
              }
            }))
          const overwriteRequests = apSettings?.lanPorts
            ?.filter(l => l.ethernetPortProfileId ).map(l => ({
              params: {
                venueId: params!.venueId,
                serialNumber: params!.serialNumber,
                portId: l.portId
              },
              payload: {
                enabled: l.enabled,
                overwriteUntagId: l.untagId,
                overwriteVlanMembers: l.vlanMembers,
                clientIsolationEnabled: l.clientIsolationEnabled,
                clientIsolationSettings: l.clientIsolationSettings
              }
            }))
          const softGreActivateRequests = apSettings?.lanPorts
            ?.filter(l => l.softGreProfileId && (l.softGreEnabled === true) && (l.enabled === true) && (!!!l.ipsecEnabled))
            .map(l => ({
              params: {
                venueId: params!.venueId,
                serialNumber: params!.serialNumber,
                portId: l.portId,
                policyId: l.softGreProfileId
              },
              payload: {
                dhcpOption82Enabled: l.dhcpOption82?.dhcpOption82Enabled,
                dhcpOption82Settings: (l.dhcpOption82?.dhcpOption82Enabled)? l.dhcpOption82?.dhcpOption82Settings : undefined
              }
            }))
          const ipsecActivateRequests = apSettings?.lanPorts
            ?.filter(l => l.softGreProfileId && (l.softGreEnabled === true) && l.ipsecProfileId && (l.ipsecEnabled === true) && (l.enabled === true))
            .map(l => ({
              params: {
                venueId: params!.venueId,
                serialNumber: params!.serialNumber,
                portId: l.portId,
                softGreProfileId: l.softGreProfileId,
                ipsecProfileId: l.ipsecProfileId
              }
            }))
          const clientIsolationActivateRequests = apSettings?.lanPorts
            ?.filter(l => {
              return l.clientIsolationEnabled
                  && l.clientIsolationProfileId
                  && (l.clientIsolationEnabled === true)
                  && (l.enabled === true)
            })
            .map(l => ({
              params: {
                venueId: params!.venueId,
                serialNumber: params!.serialNumber,
                portId: l.portId,
                policyId: l.clientIsolationProfileId
              }
            }))

          const lanPortSpecificSettings = {
            params: {
              venueId: params!.venueId,
              serialNumber: params!.serialNumber
            },
            payload: {
              poeMode: apSettings.poeMode,
              poeOut: apSettings.poeOut,
              useVenueSettings: apSettings.useVenueSettings
            }
          }

          await batchApi(EthernetPortProfileUrls.activateEthernetPortProfileOnApPortId,
            activateRequests!, fetchWithBQ, customHeaders)

          await batchApi(EthernetPortProfileUrls.updateEthernetPortOverwritesByApPortId,
            overwriteRequests!, fetchWithBQ, customHeaders)

          if(!useVenueSettings) {
            await batchApi(SoftGreUrls.activateSoftGreProfileOnAP,
              softGreActivateRequests!, fetchWithBQ, customHeaders)

            await batchApi(IpsecUrls.activateIpsecOnApLanPort,
              ipsecActivateRequests!, fetchWithBQ, customHeaders)

            await batchApi(ClientIsolationUrls.activateClientIsolationOnAp,
              clientIsolationActivateRequests!, fetchWithBQ, customHeaders)
          }


          const res = await fetchWithBQ({
            ...(createHttpRequest(WifiRbacUrlsInfo.updateApLanPortSpecificSettings,
              lanPortSpecificSettings.params,
              customHeaders)
            ),
            body: JSON.stringify(lanPortSpecificSettings.payload)
          })
          return { data: res.data as CommonResult }
        } catch (err) {
          return { error: err as FetchBaseQueryError }
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Details' }, { type: 'Ap', id: 'LanPorts' }]
    }),
    // deprecated! RBAC API will use the updateApLanPorts to replace.
    resetApLanPorts: build.mutation<WifiApSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApLanPorts, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Details' }, { type: 'Ap', id: 'LanPorts' }]
    }),
    getApLed: build.query<ApLedSettings, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApLed, params, customHeaders)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'Led' }]
    }),
    updateApLed: build.mutation<ApLedSettings, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApLed, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Led' }]
    }),
    // deprecated! RBAC API will use the updateApLed to replace.
    resetApLed: build.mutation<ApLedSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApLed, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Led' }]
    }),
    getApUsb: build.query<ApUsbSettings, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getApUsb, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'USB' }]
    }),
    updateApUsb: build.mutation<ApUsbSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApUsb, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'USB' }]
    }),
    getApBandModeSettings: build.query<ApBandModeSettings, RequestPayload<void>>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApBandModeSettings, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'BandModeSettings' }]
    }),
    updateApBandModeSettings: build.mutation<CommonResult, RequestPayload<ApBandModeSettings>>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApBandModeSettings, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'BandModeSettings' }]
    }),
    getApBandModeSettingsV1Dot1: build.query<ApBandModeSettingsV1Dot1, RequestPayload<void>>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.getApBandModeSettingsV1Dot1, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'BandModeSettings' }]
    }),
    updateApBandModeSettingsV1Dot1: build.mutation<CommonResult, RequestPayload<ApBandModeSettingsV1Dot1>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApBandModeSettingsV1Dot1, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'BandModeSettings' }]
    }),
    getApExternalAntennaSettings: build.query<ApExternalAntennaSettings, RequestPayload<void>>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getApExternalAntennaSettings, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'EXT_ANTENNA' }]
    }),
    updateApExternalAntennaSettings: build.mutation<CommonResult, RequestPayload<ApExternalAntennaSettings>>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApExternalAntennaSettings, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'EXT_ANTENNA' }]
    }),
    getApAntennaTypeSettings: build.query<ApAntennaTypeSettings, RequestPayload<void>>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApAntennaTypeSettings, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'ANTENNA' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApAntennaTypeSettings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'ANTENNA' }]))
          })
        })
      }
    }),
    updateApAntennaTypeSettings: build.mutation<CommonResult, RequestPayload<ApAntennaTypeSettings>>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApAntennaTypeSettings, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'ANTENNA' }]
    }),
    getApBssColoring: build.query<ApBssColoringSettings, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApBssColoring, params, customHeaders)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'BssColoring' }]
    }),
    updateApBssColoring: build.mutation<ApBssColoringSettings, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApBssColoring, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'BssColoring' }]
    }),
    getApSmartMonitor: build.query<ApSmartMonitor, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getApSmartMonitor, params, customHeaders)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'SmartMonitor' }]
    }),
    updateApSmartMonitor: build.mutation<ApSmartMonitor, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApSmartMonitor, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'SmartMonitor' }]
    }),
    getApIot: build.query<ApIot, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getApIot, params, customHeaders)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'Iot' }]
    }),
    updateApIot: build.mutation<ApIot, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApIot, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Iot' }]
    }),
    getApValidChannel: build.query<VenueDefaultRegulatoryChannels, RequestPayload>({
      query: ({ params, enableRbac, enableSeparation = false }) => {
        const urlsInfo = (enableSeparation || enableRbac) ? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableSeparation ? ApiVersionEnum.v1_1 :
          (enableRbac ? ApiVersionEnum.v1 : undefined)
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getApValidChannel, params, apiCustomHeader)
        return {
          ...req
        }
      }
    }),
    getApDirectedMulticast: build.query<ApDirectedMulticast, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getApDirectedMulticast, params, apiCustomHeader)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'DIRECTED_MULTICAST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApDirectedMulticast',
            'ResetApDirectedMulticast'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'DIRECTED_MULTICAST' }]))
          })
        })
      }
    }),
    updateApDirectedMulticast: build.mutation<ApDirectedMulticast, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac ? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateApDirectedMulticast, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'DIRECTED_MULTICAST' }]
    }),
    // deprecated! RBAC API will use the updateApDirectedMulticast to replace.
    resetApDirectedMulticast: build.mutation<ApDirectedMulticast, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApDirectedMulticast, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'DIRECTED_MULTICAST' }]
    }),
    getApNetworkSettings: build.query<APNetworkSettings, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApNetworkSettings, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'NETWORK_SETTINGS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApNetworkSettings',
            'ResetApNetworkSettings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'NETWORK_SETTINGS' }]))
          })
        })
      }
    }),
    updateApNetworkSettings: build.mutation<APNetworkSettings, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApNetworkSettings, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'NETWORK_SETTINGS' }]
    }),
    resetApNetworkSettings: build.mutation<APNetworkSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApNetworkSettings, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'NETWORK_SETTINGS' }]
    }),
    getApMeshSettings: build.query<APMeshSettings, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApMeshSettings, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'MESH_SETTINGS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApMeshOptions'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'MESH_SETTINGS' }]))
          })
        })
      }
    }),
    updateApMeshSettings: build.mutation<APMeshSettings, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApMeshSettings, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'MESH_SETTINGS' }]
    }),
    getMeshUplinkAps: build.query<MeshUplinkAp, RequestPayload>({
      async queryFn ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) {

        const apiInfo = enableRbac? CommonRbacUrlsInfo.getApsList : WifiUrlsInfo.getMeshUplinkAPs
        const req = createHttpRequest(apiInfo, params)
        const meshUplinkQuery = await fetchWithBQ({
          ...req,
          body: JSON.stringify(payload)
        })

        let meshUplinkApData: MeshUplinkAp

        if (enableRbac) {
          const meshUplinkApList = meshUplinkQuery.data as TableResult<NewAPModel>
          const rbacMeshUpLink = meshUplinkApList?.data[0]

          const { name, venueId, meshStatus } = rbacMeshUpLink || {}

          // add AP name into the neighbors
          const apListReq = createHttpRequest(CommonRbacUrlsInfo.getApsList, params)
          const apListPayload = {
            fields: ['name', 'macAddress'],
            page: 1,
            pageSize: 10000,
            filters: {
              venueId: [venueId]
            }
          }
          const apListQuery = await fetchWithBQ({
            ...apListReq,
            body: JSON.stringify(apListPayload)
          })
          const apListData = (apListQuery.data as TableResult<NewAPModel>)?.data
          const neighbors = meshStatus?.neighbors?.map(neighbor => {
            const { macAddress, rssi } = neighbor
            const apMac = macAddress.toUpperCase()
            const apName = apListData?.find(ap => ap.macAddress?.toUpperCase() === apMac)?.name ?? ''

            return {
              rssi: rssi,
              mac: apMac,
              apName: apName
            }
          })

          meshUplinkApData = {
            name: name ?? '',
            neighbors: neighbors ?? []
          }
        } else {
          const MeshUplinkApList = meshUplinkQuery.data as TableResult<MeshUplinkAp>
          meshUplinkApData = MeshUplinkApList?.data[0]
        }

        return {
          data: meshUplinkApData
        }
      }
    }),
    downloadApsCSV: build.mutation<Blob, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        if(customHeaders) {
          customHeaders.Accept = 'text/vnd.ruckus.v1+csv'
        }
        const req = createHttpRequest(urlsInfo.downloadApsCSV, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload),
          responseHandler: async (response) => {
            const date = new Date()
            // eslint-disable-next-line max-len
            const nowTime = date.getUTCFullYear() + ('0' + (date.getUTCMonth() + 1)).slice(-2) + ('0' + date.getUTCDate()).slice(-2) + ('0' + date.getUTCHours()).slice(-2) + ('0' + date.getUTCMinutes()).slice(-2) + ('0' + date.getUTCSeconds()).slice(-2)
            const filename = 'AP Device Inventory - ' + nowTime + '.csv'
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : filename
            downloadFile(response, fileName)
          }
        }
      }
    }),
    getApRfNeighbors: build.query<ApRfNeighborsResponse, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiUrlsInfo.getApRfNeighbors, params, { ...ignoreErrorModal })
        }
      }
    }),
    getApLldpNeighbors: build.query<ApLldpNeighborsResponse, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WifiUrlsInfo.getApLldpNeighbors, params, { ...ignoreErrorModal })
        }
      }
    }),
    getApNeighbors: build.query<ApNeighborsResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getApNeighbors, params, { ...customHeaders, ...ignoreErrorModal })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    detectApNeighbors: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        return {
          ...createHttpRequest(urlsInfo.detectApNeighbors, params, { ...customHeaders, ...ignoreErrorModal }),
          body: JSON.stringify(payload)
        }
      }
    }),
    getCcdSupportVenues: build.query<SupportCcdVenue[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getCcdSupportVenues, params)
        return {
          ...req
        }
      }
    }),
    getCcdSupportApGroups: build.query<SupportCcdApGroup[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getCcdSupportApGroups, params)
        return {
          ...req
        }
      }
    }),
    runCcd: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.runCcd, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      }
    }),
    getApClientAdmissionControl: build.query<ApClientAdmissionControl, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApClientAdmissionControl, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'ClientAdmissionControl' }]
    }),
    updateApClientAdmissionControl: build.mutation<ApClientAdmissionControl, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApClientAdmissionControl, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'ClientAdmissionControl' }]
    }),
    deleteApClientAdmissionControl: build.mutation<ApClientAdmissionControl, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteApClientAdmissionControl, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'ClientAdmissionControl' }]
    }),
    getApManagementVlan: build.query<ApManagementVlan, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.getApManagementVlan, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'ApManagementVlan' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApManagementTrafficVlanSettings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'ApManagementVlan' }]))
          })
        })
      }
    }),
    updateApManagementVlan: build.mutation<ApManagementVlan, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApManagementVlan, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'ApManagementVlan' }]
    }),
    getApFeatureSets: build.query<ApFeatureSet, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApFeatureSets, params, { ...ignoreErrorModal })
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'ApFeatureSets' }]
    }),
    // repace the getApFeatureSets
    getEnhanceApFeatureSets: build.query<FeatureSetResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...ignoreErrorModal
        }
        const req = createHttpRequest(WifiRbacUrlsInfo.getApFeatureSets, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Ap', id: 'ApFeatureSets' }]
    }),
    getApCompatibilities: build.query<CompatibilityResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const apiCustomHeader = {
          ...GetApiVersionHeader(ApiVersionEnum.v1),
          ...ignoreErrorModal
        }
        const req = createHttpRequest(WifiRbacUrlsInfo.getApCompatibilities, params, apiCustomHeader)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getApStickyClientSteering: build.query<ApStickyClientSteering, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.getApStickyClientSteering, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'StickyClientSteering' }]
    }),
    updateApStickyClientSteering: build.mutation<StickyClientSteering, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.updateApStickyClientSteering, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'StickyClientSteering' }]
    }),
    resetApStickyClientSteering: build.mutation<StickyClientSteering, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiRbacUrlsInfo.resetApStickyClientSteering, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'StickyClientSteering' }]
    })
  })
})

export const {
  useLazyApListQuery,
  useApListQuery,
  useLazyNewApListQuery,
  useNewApListQuery,
  useApDetailHeaderQuery,
  useApViewModelQuery,
  useApDetailsQuery,
  useAddApMutation,
  usePingApMutation,
  useTraceRouteApMutation,
  useGetApQuery,
  useGetApOperationalQuery,
  useLazyGetApQuery,
  useUpdateApMutation,
  useAddApGroupMutation,
  useApGroupListByVenueQuery,
  useLazyApGroupListByVenueQuery,
  useApGroupsListQuery,
  useLazyApGroupsListQuery,
  useWifiCapabilitiesQuery,
  useVenueDefaultApGroupQuery,
  useLazyVenueDefaultApGroupQuery,
  useDeleteApMutation,
  useDeleteSoloApMutation,
  useDownloadApLogMutation,
  useRebootApMutation,
  useBlinkLedApMutation,
  useFactoryResetApMutation,
  useImportApMutation,
  useLazyImportResultQuery,
  useLazyGetDhcpApQuery,
  useGetApPhotoQuery,
  useAddApPhotoMutation,
  useDeleteApPhotoMutation,
  useGetApRadioCustomizationQuery,
  useGetApGroupRadioCustomizationQuery,
  useLazyGetApGroupRadioCustomizationQuery,
  useUpdateApRadioCustomizationMutation,
  useGetApRadioCustomizationV1Dot1Query,
  useUpdateApRadioCustomizationV1Dot1Mutation,
  useUpdateApGroupRadioCustomizationMutation,
  useGetPacketCaptureStateQuery,
  useStopPacketCaptureMutation,
  useStartPacketCaptureMutation,
  useGetDefaultApLanPortsQuery,
  useGetApLanPortsQuery,
  useGetApLanPortsWithActivatedProfilesQuery,
  useUpdateApLanPortsMutation,
  useUpdateApEthernetPortsMutation,
  useResetApLanPortsMutation,
  useGetApLedQuery,
  useUpdateApLedMutation,
  useResetApLedMutation,
  useGetApUsbQuery,
  useUpdateApUsbMutation,
  useGetApBandModeSettingsQuery,
  useLazyGetApBandModeSettingsQuery,
  useUpdateApBandModeSettingsMutation,
  useGetApBandModeSettingsV1Dot1Query,
  useUpdateApBandModeSettingsV1Dot1Mutation,
  useGetApGroupApModelBandModeSettingsQuery,
  useLazyGetApGroupApModelBandModeSettingsQuery,
  useUpdateApGroupApModelBandModeSettingsMutation,
  useLazyGetApExternalAntennaSettingsQuery,
  useUpdateApExternalAntennaSettingsMutation,
  useGetApAntennaTypeSettingsQuery,
  useLazyGetApAntennaTypeSettingsQuery,
  useUpdateApAntennaTypeSettingsMutation,
  useGetApBssColoringQuery,
  useUpdateApBssColoringMutation,
  useGetApSmartMonitorQuery,
  useLazyGetApSmartMonitorQuery,
  useUpdateApSmartMonitorMutation,
  useGetApIotQuery,
  useLazyGetApIotQuery,
  useUpdateApIotMutation,
  useGetApCapabilitiesQuery,     // deprecated
  useLazyGetApCapabilitiesQuery, // deprecated
  useGetOldApCapabilitiesByModelQuery,
  useLazyGetOldApCapabilitiesByModelQuery,
  useGetApGroupDefaultRegulatoryChannelsQuery,
  useGetApGroupApCapabilitiesQuery,
  useGetApCapabilitiesByModelQuery,
  useLazyGetApCapabilitiesByModelQuery,
  useGetApValidChannelQuery,
  useLazyGetApValidChannelQuery,
  useGetApDirectedMulticastQuery,
  useUpdateApDirectedMulticastMutation,
  useResetApDirectedMulticastMutation,
  useGetApNetworkSettingsQuery,
  useUpdateApNetworkSettingsMutation,
  useResetApNetworkSettingsMutation,
  useDeleteApGroupsMutation,
  useDeleteApGroupMutation,
  useUpdateApGroupMutation,
  useGetApGroupQuery,
  useGetApMeshSettingsQuery,
  useUpdateApMeshSettingsMutation,
  useGetMeshUplinkApsQuery,
  useLazyGetMeshUplinkApsQuery,
  useDownloadApsCSVMutation,
  useLazyGetApRfNeighborsQuery,
  useLazyGetApLldpNeighborsQuery,
  useDetectApNeighborsMutation,
  useGetCcdSupportVenuesQuery,
  useGetCcdSupportApGroupsQuery,
  useLazyGetCcdSupportApGroupsQuery,
  useRunCcdMutation,
  useGetApClientAdmissionControlQuery,
  useUpdateApClientAdmissionControlMutation,
  useDeleteApClientAdmissionControlMutation,
  useGetApManagementVlanQuery,
  useLazyGetApManagementVlanQuery,
  useUpdateApManagementVlanMutation,
  useLazyGetApFeatureSetsQuery,
  useLazyGetEnhanceApFeatureSetsQuery,
  useLazyGetApCompatibilitiesQuery,
  useLazyGetApNeighborsQuery,
  useMoveApToTargetApGroupMutation,
  useGetApStickyClientSteeringQuery,
  useUpdateApStickyClientSteeringMutation,
  useResetApStickyClientSteeringMutation
} = apApi

export function isAPLowPower (afcInfo?: AFCInfo): boolean {
  if (!afcInfo) return false
  return (
    afcInfo?.powerMode === AFCPowerMode.LOW_POWER &&
    afcInfo?.afcStatus !== AFCStatus.AFC_NOT_REQUIRED)
}

const getVenueDhcpRelation = async (
  payload: { venueId: string, serialNumber: string }[],
  fetchWithBQ: (arg: string | FetchArgs) =>
    MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>
) => {
  const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
  const newPayload = payload as { venueId: string, serialNumber: string }[]
  const venueIds = uniq(newPayload.map(item => item.venueId))
  const dhcpListPayload = {
    fields: ['id', 'venueIds'],
    filters: { venueIds }
  }

  const dhcpListReq = createHttpRequest(DHCPUrls.queryDhcpProfiles, undefined, customHeaders)
  const dhcpListRes = await fetchWithBQ({ ...dhcpListReq, body: JSON.stringify(dhcpListPayload) })
  const dhcpList = (dhcpListRes.data as TableResult<DHCPSaveData>).data
  return reduce(newPayload,
    (result, item) => {
      const dhcpInfo = dhcpList?.find(dhcpItem => dhcpItem.venueIds?.includes(item.venueId))
      result[item.venueId] = dhcpInfo?.id
      return result
    }, {} as { [venueId: string]: string | undefined }) // {venueId: dhcpId}
}

const setDhcpProfileToCache = async (
  cacheDhcpProfileData: { [dhcpId: string]: DHCPSaveData },
  fetchWithBQ: (arg: string | FetchArgs) =>
    MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>,
  dhcpId?: string
) => {
  if (
    dhcpId &&
    !Boolean(cacheDhcpProfileData[dhcpId])
  ) {
    const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
    const venueDhcpSettingReq = createHttpRequest(
      DHCPUrls.getDHCProfileDetail,
      { serviceId: dhcpId },
      customHeaders
    )
    const venueDhcpSettingRes = await fetchWithBQ(venueDhcpSettingReq)
    cacheDhcpProfileData[dhcpId] = venueDhcpSettingRes.data as DHCPSaveData
  }
}
