/* eslint-disable max-len */
import { QueryReturnValue }                                   from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise }                                       from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { isNil, omit, pick, reduce, uniq }                    from 'lodash'

import { Filter }           from '@acx-ui/components'
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
  ApBssColoringSettings,
  ApClientAdmissionControl,
  ApDeep,
  ApDetailHeader,
  ApDetails,
  ApDirectedMulticast,
  ApExtraParams,
  ApFeatureSet,
  ApGroup,
  ApGroupViewModel,
  ApLanPort,
  ApLedSettings,
  ApLldpNeighborsResponse,
  ApManagementVlan,
  ApNeighborsResponse,
  ApPosition,
  ApRadioCustomization,
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
  NewApGroupViewModelResponseType,
  NewDhcpAp,
  NewGetApGroupResponseType,
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
  WifiNetwork,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  downloadFile,
  onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseApApi }                                    from '@acx-ui/store'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import {
  aggregateApGroupApInfo,
  aggregateApGroupNetworkInfo,
  aggregateApGroupVenueInfo,
  getApGroupNewFieldFromOld,
  getNewApGroupViewmodelPayloadFromOld,
  transformApGroupFromNewType
} from './apGroupUtils'
import {
  aggregateApGroupInfo,
  aggregatePoePortInfo,
  aggregateVenueInfo,
  getApListFn,
  getApViewmodelListFn,
  transformApListFromNewModel,
  transformGroupByListFromNewModel
} from './apUtils'
import { isPayloadHasField } from './utils'


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
    newApList: build.query<TableResult<NewAPModelExtended|NewAPExtendedGrouped, ApExtraParams>,
    RequestPayload>({
      queryFn: async ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const hasGroupBy = (payload as ApRequestPayload)?.groupBy
        // const isGroupByApGroup = hasGroupBy && (payload as ApRequestPayload)?.groupBy === 'apGroupId'
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        // let groupByApGroupList
        // let newPayload = payload
        // if(isGroupByApGroup) {
        //   [groupByApGroupList, newPayload] = await groupByApGroupPreProcess(payload as ApRequestPayload, fetchWithBQ)
        // }
        const apsReq = createHttpRequest(CommonRbacUrlsInfo.getApsList, params, apiCustomHeader)
        const apListRes = await fetchWithBQ({ ...apsReq, body: JSON.stringify(payload) })
        let apList
        let venueIds
        let groupIds
        let apGroupList
        if(hasGroupBy) {
          apList = apListRes.data as TableResult<NewAPExtendedGrouped, ApExtraParams>
          venueIds = apList.data.flatMap(item => item.aps.map(item => item.venueId))
          groupIds = apList.data.flatMap(item => item.aps.map(item => item.apGroupId))
        } else {
          apList = apListRes.data as TableResult<NewAPModelExtended, ApExtraParams>
          venueIds = apList.data.map(item => item.venueId).filter(item => item)
          groupIds = apList.data.map(item => item.apGroupId).filter(item => item)
        }
        if(venueIds.length > 0) {
          const venuePayload = {
            fields: ['name', 'id'],
            pageSize: 10000,
            filters: { id: venueIds }
          }
          const venueListRes = await fetchWithBQ({ ...createHttpRequest(CommonUrlsInfo.getVenuesList), body: venuePayload })
          const venueList = venueListRes.data as TableResult<Venue>
          aggregateVenueInfo(apList, venueList)
        }
        if(groupIds.length > 0) {
          // if(isGroupByApGroup) {
          //   aggregateApGroupInfo(apList, groupByApGroupList as TableResult<NewApGroupViewModelResponseType>)
          // } else {
          const apGroupPayload = {
            fields: ['name', 'id', 'wifiNetworkIds'],
            pageSize: 10000,
            filters: { id: groupIds }
          }
          const apGroupListRes = await fetchWithBQ({ ...createHttpRequest(WifiRbacUrlsInfo.getApGroupsList), body: apGroupPayload })
          apGroupList = apGroupListRes.data as TableResult<NewApGroupViewModelResponseType>
          aggregateApGroupInfo(apList, apGroupList)
          // }
        }
        const capabilitiesRes = await fetchWithBQ(createHttpRequest(WifiRbacUrlsInfo.getWifiCapabilities, apiCustomHeader))
        const capabilities = capabilitiesRes.data as Capabilities
        aggregatePoePortInfo(apList, capabilities)
        if(hasGroupBy) {
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
      async queryFn ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const apGroupListReq = createHttpRequest(urlsInfo.getApGroupsList, params, customHeaders)

        let apGroups: TableResult<ApGroupViewModel>
        if (enableRbac) {
          const newPayload = getNewApGroupViewmodelPayloadFromOld(payload as Record<string, unknown>)
          const apGroupListQuery = await fetchWithBQ({
            ...apGroupListReq,
            body: JSON.stringify(newPayload)
          })

          // simplely map new fields into old fields
          const rbacApGroups = apGroupListQuery.data as TableResult<NewApGroupViewModelResponseType>
          apGroups = {
            ...omit(rbacApGroups, ['data']),
            data: [] as ApGroupViewModel[]
          } as TableResult<ApGroupViewModel>

          rbacApGroups.data.forEach(group => {
            apGroups.data.push({
              ...pick(group, ['id', 'name', 'venueId', 'isDefault']),
              clients: group.clientCount
            } as ApGroupViewModel)
          })

          const defaultIdNamePayload = {
            fields: ['name', 'id'],
            pageSize: 10000
          }

          // fetch venue name
          const venueIds = uniq(rbacApGroups.data.map(item => item.venueId))
          if (venueIds.length && isPayloadHasField(payload, 'venueName')) {
            const venueListQuery = await fetchWithBQ({
              ...createHttpRequest(CommonRbacUrlsInfo.getVenuesList),
              body: { ...defaultIdNamePayload, filters: { id: venueIds } }
            })
            const venueList = venueListQuery.data as TableResult<Venue>
            aggregateApGroupVenueInfo(apGroups, venueList)
          }

          // fetch networks name
          const networkIds = uniq(rbacApGroups.data.flatMap(item => item[getApGroupNewFieldFromOld('networks') as keyof typeof item]))
          if (networkIds.length && isPayloadHasField(payload, 'networks')) {
            const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params, customHeaders)
            const networkListQuery = await fetchWithBQ({
              ...networkListReq,
              body: JSON.stringify({ ...defaultIdNamePayload, filters: { id: networkIds } })
            })
            const networks = networkListQuery.data as TableResult<WifiNetwork>
            aggregateApGroupNetworkInfo(apGroups, rbacApGroups, networks)
          }

          // fetch aps name
          const apIds = uniq(rbacApGroups.data
            .flatMap(item => item[getApGroupNewFieldFromOld('members') as keyof typeof item])
            .filter(i => !isNil(i)))

          if (apIds.length && isPayloadHasField(payload, ['members', 'aps'])) {
            const apQueryPayload = {
              fields: ['name', 'serialNumber'],
              pageSize: 10000,
              filters: { id: apIds }
            }
            const apsListQuery = await fetchWithBQ({
              ...createHttpRequest(CommonRbacUrlsInfo.getApsList, params, customHeaders),
              body: JSON.stringify(apQueryPayload)
            })
            const aps = apsListQuery.data as TableResult<NewAPModel>
            aggregateApGroupApInfo(apGroups, rbacApGroups, aps)
          }
        } else {
          const apGroupListQuery = await fetchWithBQ({
            ...apGroupListReq,
            body: JSON.stringify(payload)
          })
          apGroups = apGroupListQuery.data as TableResult<ApGroupViewModel>
        }

        return { data: apGroups }
      },
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
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const apGroupQuery = await fetchWithBQ(createHttpRequest(urlsInfo.getApGroup, params, customHeaders))

        let apGroup: ApGroup
        if (enableRbac) {
          const newApGroupData = apGroupQuery.data as NewGetApGroupResponseType
          let rbacAps: TableResult<NewAPModel> = {
            data: [],
            totalCount: 0,
            page: 1
          }
          if (newApGroupData.apSerialNumbers?.length) {
            const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
            const apListQuery = await fetchWithBQ({
              ...createHttpRequest(CommonRbacUrlsInfo.getApsList, params, customHeaders),
              body: JSON.stringify({
                fields: ['serialNumber', 'name'],
                filters: { serialNumber: newApGroupData.apSerialNumbers },
                pageSize: 10000,
                sortField: 'name',
                sortOrder: 'ASC'
              })
            })

            rbacAps = apListQuery.data as TableResult<NewAPModel>
          }

          apGroup = transformApGroupFromNewType(newApGroupData, rbacAps)
          apGroup.venueId = params!.venueId as string
        } else {
          apGroup = apGroupQuery.data as ApGroup
        }

        return { data: apGroup }
      },
      providesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    addApGroup: build.mutation<AddApGroup, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1_1 : undefined)
        const req = createHttpRequest(urlsInfo.addApGroup, params, customHeaders)

        let newPayload: AddApGroup = { ...(payload as AddApGroup) }
        // transform payload
        if (enableRbac) {
          newPayload.apSerialNumbers = newPayload.apSerialNumbers
            ?.map(i => (i as { serialNumber: string }).serialNumber) ?? []
        }

        return {
          ...req,
          body: JSON.stringify(newPayload)
        }
      },
      invalidatesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    updateApGroup: build.mutation<AddApGroup, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApGroup, params, customHeaders)

        let newPayload: AddApGroup = { ...(payload as AddApGroup) }
        // transform payload
        if (enableRbac) {
          newPayload.apSerialNumbers = newPayload.apSerialNumbers
            ?.map(i => (i as { serialNumber: string }).serialNumber) ?? []
        }

        return {
          ...req,
          body: JSON.stringify(newPayload)
        }
      },
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
          ...ignoreErrorModal,
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
            fields: ['id', 'apSerialNumbers'],
            filters: {
              apSerialNumbers: [params?.serialNumber]
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
            'ResetApCustomization'
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
          const apGroupPayload = {
            fields: ['id'],
            pageSize: 1,
            filters: { apSerialNumbers: [ap.serialNumber] }
          }
          const apGroupListReq = createHttpRequest(WifiRbacUrlsInfo.getApGroupsList, params, apiCustomHeader)
          const apGroupListRes = await fetchWithBQ({ ...apGroupListReq, body: JSON.stringify(apGroupPayload) })
          const apGroupList = apGroupListRes.data as TableResult<ApGroup>
          const targetApGroup = apGroupList.data[0]
          if(targetApGroup) {
            ap.apGroupId = targetApGroup.id
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
          ...ignoreErrorModal,
          ...apiCustomHeader
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
        const venueDhcpMap = await getVenueDhcpRelation(newPayload, fetchWithBQ)
        const result = [] as DhcpApInfo[]
        const cacheDhcpProfileData: { [dhcpId: string]: DHCPSaveData } = {}
        for (let item of newPayload) {
          const dhcpApReq = createHttpRequest(
            WifiRbacUrlsInfo.getDhcpAp,
            { venueId: item.venueId, serialNumber: item.serialNumber },
            customHeaders
          )
          const dhcpApRes = await fetchWithBQ(dhcpApReq)
          const dhcpAp = dhcpApRes.data as NewDhcpAp
          if (!dhcpAp) continue

          const dhcpId = venueDhcpMap[item.venueId]
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
    apLanPorts: build.query<ApLanPort, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApLanPorts, params)
        return {
          ...req
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
        return {
          ...req
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
    getApCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params }) => { // non RBAC API
        const req = createHttpRequest(WifiUrlsInfo.getApCapabilities, params)
        return {
          ...req
        }
      }
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
    getApLanPorts: build.query<WifiApSetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApLanPorts, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'LanPorts' }]
    }),
    updateApLanPorts: build.mutation<WifiApSetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApLanPorts, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Details' }, { type: 'Ap', id: 'LanPorts' }]
    }),
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
    resetApLed: build.mutation<ApLedSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApLed, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Led' }]
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getMeshUplinkAPs, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: TableResult<MeshUplinkAp>) {
        return result?.data[0]
      }
    }),
    downloadApsCSV: build.mutation<Blob, ApsExportPayload>({
      query: (payload) => {
        const req = createHttpRequest(CommonUrlsInfo.downloadApsCSV,
          { tenantId: payload.tenantId }
        )
        return {
          ...req,
          body: payload,
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
        const req = createHttpRequest(WifiUrlsInfo.getApManagementVlan, params)
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
        const req = createHttpRequest(WifiUrlsInfo.updateApManagementVlan, params)
        return {
          ...req,
          body: payload
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
  useApLanPortsQuery,
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
  useUpdateApRadioCustomizationMutation,
  useGetPacketCaptureStateQuery,
  useStopPacketCaptureMutation,
  useStartPacketCaptureMutation,
  useGetApLanPortsQuery,
  useUpdateApLanPortsMutation,
  useResetApLanPortsMutation,
  useGetApLedQuery,
  useUpdateApLedMutation,
  useResetApLedMutation,
  useGetApBandModeSettingsQuery,
  useLazyGetApBandModeSettingsQuery,
  useUpdateApBandModeSettingsMutation,
  useGetApAntennaTypeSettingsQuery,
  useLazyGetApAntennaTypeSettingsQuery,
  useUpdateApAntennaTypeSettingsMutation,
  useGetApBssColoringQuery,
  useUpdateApBssColoringMutation,
  useGetApCapabilitiesQuery,     // deprecated
  useLazyGetApCapabilitiesQuery, // deprecated
  useGetOldApCapabilitiesByModelQuery,
  useLazyGetOldApCapabilitiesByModelQuery,
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
  useLazyGetApNeighborsQuery,
  useMoveApToTargetApGroupMutation
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
  const dhcpListPayload = {
    fields: ['id', 'venueIds'],
    filters: {
      venueIds: newPayload.map(item => item.venueId)
    }
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

// will return apGroupList by pagination
// const groupByApGroupPreProcess = async (
//   payload: ApRequestPayload,
//   fetchWithBQ: (arg: string | FetchArgs) =>
//   MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>
// ) => {
//   const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
//   const apGroupListPayload = {
//     fields: ['id', 'name', 'apSerialNumbers', 'wifiNetworkIds', 'isDefault', 'venueId'],
//     filters: { isDefault: [false] },
//     sortField: payload.sortField === 'name' ? 'name' : '',
//     sortOrder: payload.sortField === 'name' ? payload.sortOrder : '',
//     page: payload.page,
//     pageSize: payload.pageSize
//   }
//   const apGroupListReq = createHttpRequest(WifiRbacUrlsInfo.getApGroupsList, {}, customHeaders)
//   const apGroupListRes = await fetchWithBQ({ ...apGroupListReq, body: JSON.stringify(apGroupListPayload) })
//   const result = (apGroupListRes?.data as TableResult<NewApGroupViewModelResponseType>)
//   if(
//     (
//       // default order OR ASC AND at first page
//       (!payload.sortOrder || payload.sortOrder === 'ASC') && payload.page === 1
//     ) ||
//     (
//       // DESC AND at last page
//       payload.sortOrder === 'DESC' &&
//       payload.page * payload.pageSize >= ((apGroupListRes.data as TableResult<NewApGroupViewModelResponseType>)?.totalCount ?? 0)
//     )
//   ) {
//     const defaultApGroupListPayload = {
//       fields: ['id', 'name', 'apSerialNumbers', 'wifiNetworkIds', 'isDefault', 'venueId'],
//       filters: { isDefault: [true] },
//       page: 1,
//       pageSize: 10000
//     }
//     const defaultApGroupListRes = await fetchWithBQ({ ...apGroupListReq, body: JSON.stringify(defaultApGroupListPayload) })
//     const defaultApGroupList = (defaultApGroupListRes?.data as TableResult<NewApGroupViewModelResponseType>)?.data
//     result.data = result.data.concat(defaultApGroupList)
//   }
//   const newPayload = cloneDeep(payload)
//   newPayload.filters = {
//     ...payload.filters,
//     serialNumber: [
//       ...(payload.filters.serialNumber || []),
//       ...result.data.flatMap(item => item.apSerialNumbers ?? [])
//     ]
//   }
//   return [result, newPayload]
// }
