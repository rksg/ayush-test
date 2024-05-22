/* eslint-disable max-len */
import _          from 'lodash'
import { Params } from 'react-router-dom'

import { Filter }                    from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  AFCInfo,
  AFCPowerMode,
  AFCStatus,
  AP,
  APExtended,
  APExtendedGrouped,
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
  ApRadioBands,
  ApRadioCustomization,
  ApRfNeighborsResponse,
  ApViewModel,
  ApiVersionEnum,
  Capabilities,
  CommonRbacUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  DhcpAp,
  GetApiVersionHeader,
  ImportErrorRes,
  LanPortStatusProperties,
  MeshUplinkAp,
  PacketCaptureOperationResponse,
  PacketCaptureState,
  PingAp,
  RadioProperties,
  RequestFormData,
  SEARCH,
  SORTER,
  SupportCcdApGroup,
  SupportCcdVenue,
  TableResult,
  VenueDefaultApGroup,
  VenueDefaultRegulatoryChannels,
  WifiApSetting,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  downloadFile,
  onActivityMessageReceived,
  onSocketActivityChanged,
  ApiVersionEnum
} from '@acx-ui/rc/utils'
import { baseApApi }                                    from '@acx-ui/store'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

export type ApsExportPayload = {
  filters: Filter
  tenantId: string
} & SEARCH & SORTER

export const apApi = baseApApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<TableResult<APExtended | APExtendedGrouped, ApExtraParams>,
    RequestPayload>({
      query: ({ params, payload, enableRbac }:
        { payload:Record<string,unknown>, params: Params<string>, enableRbac: boolean }) => {
        const hasGroupBy = payload?.groupBy
        const fields = hasGroupBy ? payload.groupByFields : payload.fields
        const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const apsReq = hasGroupBy
          ? createHttpRequest(CommonUrlsInfo.getApGroupsListByGroup, params)
          : createHttpRequest(urlsInfo.getApsList, params, apiCustomHeader)
        const requestPayload = enableRbac ?
          JSON.stringify({ ...payload, fields: fields }) :
          { ...payload, fields: fields }
        return {
          ...apsReq,
          body: requestPayload
        }
      },
      transformResponse (
        result: TableResult<APExtended, ApExtraParams>,
        _: unknown,
        args: { payload : Record<string,unknown> }
      ) {
        if((args?.payload)?.groupBy)
          return transformGroupByList(result as TableResult<APExtendedGrouped, ApExtraParams>)
        return transformApList(result)
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
    apGroupListByVenue: build.query<ApGroup[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApGroupListByVenue, params)
        return {
          ...req
        }
      }
    }),
    apGroupsList: build.query<TableResult<ApGroupViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const apGroupListReq = createHttpRequest(WifiUrlsInfo.getApGroupsList, params)
        return {
          ...apGroupListReq,
          body: payload
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'ApGroup', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddApGroup',
            'UpdateApGroup',
            'DeleteApGroups',
            'AddApGroupLegacy'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'ApGroup', id: 'LIST' }]))
          })
        })
      }
    }),
    getApGroup: build.query<ApGroup, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApGroup, params, customHeaders)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    addApGroup: build.mutation<AddApGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addApGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    addApGroupV1_1: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1_1)
        const req = createHttpRequest(WifiRbacUrlsInfo.addApGroup, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'ApGroup', id: 'LIST' }, { type: 'Ap', id: 'LIST' }]
    }),
    updateApGroup: build.mutation<ApGroup, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApGroup, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
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
          body: enableRbac ? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    importApOld: build.mutation<ImportErrorRes, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addAp, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    importAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addAp, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
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
            if (response && msg.useCase === 'ImportApsCsv'
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
      query: ({ params, payload }) => {
        const { requestId } = payload as { requestId: string }
        const api:ApiInfo = { ...WifiUrlsInfo.getImportResult }
        api.url += `?requestId=${requestId}`
        const req = createHttpRequest(api, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0
    }),
    getAp: build.query<ApDeep, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getAp, params, apiCustomHeader)
        return {
          ...req
        }
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
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getApOperational, params, apiCustomHeader)
        return {
          ...req
        }
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
          body: enableRbac ? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }, { type: 'Ap', id: 'Details' }]
    }),
    deleteAp: build.mutation<AP, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        let api
        if(enableRbac) {
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
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getWifiCapabilities, params)
        return {
          ...req
        }
      }
    }),
    deleteSoloAp: build.mutation<AP, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        let api
        if(enableRbac) {
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getDhcpAp, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    downloadApLog: build.mutation<{ fileURL: string }, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.downloadApLog, params)
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
    apViewModel: build.query<ApViewModel, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: TableResult<ApViewModel, ApExtraParams>) {
        return transformApViewModel(result?.data[0])
      }
    }),
    apDetails: build.query<ApDetails, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const apiCustomHeader = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.getAp, params, apiCustomHeader)
        return {
          ...req
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
          body: enableRbac ? JSON.stringify(payload) : payload
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
        return{
          ...req,
          body: enableRbac ? JSON.stringify(payload) : payload
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
          body: enableRbac ? JSON.stringify(payload) : payload
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
          body: enableRbac ? JSON.stringify(payload) : payload
        }
      }
    }),
    getApRadioCustomization: build.query<ApRadioCustomization, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApRadioCustomization, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'RADIO' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApRadioCustomization',
            'ResetApRadioCustomization'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'RADIO' }]))
          })
        })
      }
    }),
    updateApRadioCustomization: build.mutation<ApRadioCustomization, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApRadioCustomization, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'RADIO' }]
    }),
    deleteApRadioCustomization: build.mutation<ApRadioCustomization, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteApRadioCustomization, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'RADIO' }]
    }),
    getApCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApCapabilities, params)
        return {
          ...req
        }
      }
    }),
    getPacketCaptureState: build.query<PacketCaptureState, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getPacketCaptureState, params)
        return {
          ...req
        }
      }
    }),

    getApPhoto: build.query<APPhoto, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApPhoto, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'PHOTO' }],
      keepUnusedDataFor: 0
    }),
    addApPhoto: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addApPhoto, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'PHOTO' }]
    }),
    deleteApPhoto: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteApPhoto, params)
        return{
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'PHOTO' }]
    }),
    startPacketCapture: build.mutation<PacketCaptureOperationResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.startPacketCapture, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    stopPacketCapture: build.mutation<PingAp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.stopPacketCapture, params)
        return {
          ...req,
          body: payload
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApLed, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'Led' }]
    }),
    updateApLed: build.mutation<ApLedSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApLed, params)
        return {
          ...req,
          body: payload
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
      query: ({ params }) => createHttpRequest(WifiUrlsInfo.getApBandModeSettings, params),
      providesTags: [{ type: 'Ap', id: 'BandModeSettings' }]
    }),
    updateApBandModeSettings: build.mutation<CommonResult, RequestPayload<ApBandModeSettings>>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(WifiUrlsInfo.updateApBandModeSettings, params),
        body: payload
      }),
      invalidatesTags: [{ type: 'Ap', id: 'BandModeSettings' }]
    }),
    getApAntennaTypeSettings: build.query<ApAntennaTypeSettings, RequestPayload<void>>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApAntennaTypeSettings, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'ANTENNA' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateApAntennaTypeSettings',
            'ResetApAntennaTypeSettings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'ANTENNA' }]))
          })
        })
      }
    }),
    updateApAntennaTypeSettings: build.mutation<CommonResult, RequestPayload<ApAntennaTypeSettings>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApAntennaTypeSettings, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'ANTENNA' }]
    }),
    resetApAntennaTypeSettings: build.mutation<CommonResult, RequestPayload<void>>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApAntennaTypeSettings, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'ANTENNA' }]
    }),
    getApBssColoring: build.query<ApBssColoringSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApBssColoring, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'BssColoring' }]
    }),
    updateApBssColoring: build.mutation<ApBssColoringSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApBssColoring, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'BssColoring' }]
    }),
    getApCustomization: build.query<WifiApSetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApCustomization, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'LanPorts' }]
    }),
    updateApCustomization: build.mutation<WifiApSetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApCustomization, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Details' }, { type: 'Ap', id: 'LanPorts' }]
    }),
    resetApCustomization: build.mutation<WifiApSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApCustomization, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'Details' }, { type: 'Ap', id: 'LanPorts' }]
    }),
    getApValidChannel: build.query<VenueDefaultRegulatoryChannels, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApValidChannel, params)
        return {
          ...req
        }
      }
    }),
    getApDirectedMulticast: build.query<ApDirectedMulticast, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.getApDirectedMulticast, params, apiCustomHeader)
        return{
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
        const urlsInfo = enableRbac? WifiRbacUrlsInfo : WifiUrlsInfo
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateApDirectedMulticast, params, apiCustomHeader)
        return{
          ...req,
          body: enableRbac? JSON.stringify(payload) : payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'DIRECTED_MULTICAST' }]
    }),
    // deprecated! RBAC API will use the updateApDirectedMulticast to replace.
    resetApDirectedMulticast: build.mutation<ApDirectedMulticast, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApDirectedMulticast, params)
        return{
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
        return{
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
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'NETWORK_SETTINGS' }]
    }),
    resetApNetworkSettings: build.mutation<APNetworkSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.resetApNetworkSettings, params)
        return{
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
        return{
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
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
        const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(urlsInfo.updateApMeshSettings, params, customHeaders)
        return{
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
    detectApNeighbors: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WifiUrlsInfo.detectApNeighbors, params, { ...ignoreErrorModal }),
          body: payload
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
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApClientAdmissionControl, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'ClientAdmissionControl' }]
    }),
    updateApClientAdmissionControl: build.mutation<ApClientAdmissionControl, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApClientAdmissionControl, params)
        return{
          ...req,
          body: payload
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
        return{
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
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'ApManagementVlan' }]
    }),
    getApFeatureSets: build.query<ApFeatureSet, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApFeatureSets, params, { ...ignoreErrorModal })
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'ApFeatureSets' }]
    })
  })
})

export const {
  useApListQuery,
  useLazyApListQuery,
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
  useAddApGroupV1_1Mutation,
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
  useImportApOldMutation,
  useImportApMutation,
  useLazyImportResultQuery,
  useLazyGetDhcpApQuery,
  useGetApPhotoQuery,
  useAddApPhotoMutation,
  useDeleteApPhotoMutation,
  useGetApRadioCustomizationQuery,
  useUpdateApRadioCustomizationMutation,
  useDeleteApRadioCustomizationMutation,
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
  useUpdateApBandModeSettingsMutation,
  useGetApAntennaTypeSettingsQuery,
  useLazyGetApAntennaTypeSettingsQuery,
  useUpdateApAntennaTypeSettingsMutation,
  useResetApAntennaTypeSettingsMutation,
  useGetApBssColoringQuery,
  useUpdateApBssColoringMutation,
  useGetApCapabilitiesQuery,
  useLazyGetApCapabilitiesQuery,
  useGetApCustomizationQuery,
  useUpdateApCustomizationMutation,
  useResetApCustomizationMutation,
  useGetApValidChannelQuery,
  useLazyGetApValidChannelQuery,
  useGetApDirectedMulticastQuery,
  useUpdateApDirectedMulticastMutation,
  useResetApDirectedMulticastMutation,
  useGetApNetworkSettingsQuery,
  useUpdateApNetworkSettingsMutation,
  useResetApNetworkSettingsMutation,
  useDeleteApGroupsMutation,
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
  useLazyGetApFeatureSetsQuery
} = apApi


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setAPRadioInfo = (row: APExtended, APRadio: RadioProperties[], channelColunnnShow: any) => {

  const apRadio24 = _.find(APRadio, r => r.band === ApRadioBands.band24)
  const apRadioU50 = _.find(APRadio,
    r => r.band === ApRadioBands.band50 && r.radioId === 2)
  const apRadio50 = !apRadioU50 &&_.find(APRadio,
    r => r.band === ApRadioBands.band50 && r.radioId === 1)
  const apRadio60 = !apRadioU50 && _.find(APRadio,
    r => r.radioId === 2)
  const apRadioL50 = apRadioU50 && _.find(APRadio,
    r => r.band === ApRadioBands.band50 && r.radioId === 1)

  row.channel24 = apRadio24?.channel || undefined
  row.channel50 = (apRadio50 && apRadio50.channel) || undefined
  row.channelL50 = apRadioL50?.channel || undefined
  row.channelU50 = apRadioU50?.channel || undefined
  row.channel60 = (apRadio60 && apRadio60.channel) || undefined


  if (channelColunnnShow) {
    if (!channelColunnnShow.channel24 && apRadio24) channelColunnnShow.channel24 = true
    if (!channelColunnnShow.channel50 && apRadio50) channelColunnnShow.channel50 = true
    if (!channelColunnnShow.channelL50 && apRadioL50) channelColunnnShow.channelL50 = true
    if (!channelColunnnShow.channelU50 && apRadioU50) channelColunnnShow.channelU50 = true
    if (!channelColunnnShow.channel60 && apRadio60) channelColunnnShow.channel60 = true
  }

}

const setPoEPortStatus = (row: APExtended, lanPortStatus: LanPortStatusProperties[]) => {
  if (!lanPortStatus) {
    return
  }

  const poeStatus = _.find(lanPortStatus, status => status.port === row.poePort)
  if (poeStatus) {
    const [poeStatusUp, poePortInfo] = poeStatus.phyLink.split(' ')
    row.hasPoeStatus = !!poeStatus
    row.isPoEStatusUp = poeStatusUp.includes('Up')
    row.poePortInfo = poePortInfo
  }
}

const transformApList = (result: TableResult<APExtended, ApExtraParams>) => {
  let channelColumnStatus = {
    channel24: false,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }

  result.data = result.data.map(item => {
    const { APRadio, lanPortStatus } = item.apStatusData || {}

    if (APRadio) {
      setAPRadioInfo(item, APRadio, channelColumnStatus)
    }

    if (lanPortStatus) {
      setPoEPortStatus(item, lanPortStatus)
    }

    return item
  })
  result.extra = channelColumnStatus
  return result
}

const transformGroupByList = (result: TableResult<APExtendedGrouped, ApExtraParams>) => {
  let channelColumnStatus = {
    channel24: false,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }
  result.data = result.data.map(item => {
    let newItem = { ...item, children: [] as APExtended[], serialNumber: _.uniqueId() }
    const aps = (item as unknown as { aps: APExtended[] }).aps?.map(ap => {
      const { APRadio, lanPortStatus } = ap.apStatusData || {}

      if (APRadio) {
        setAPRadioInfo(ap, APRadio, channelColumnStatus)
      }
      if (lanPortStatus) {
        setPoEPortStatus(ap, lanPortStatus)
      }
      return ap
    })
    newItem.children = aps as unknown as APExtended[]
    return newItem
  })
  result.extra = channelColumnStatus
  return result

}

const transformApViewModel = (result: ApViewModel) => {
  const ap = JSON.parse(JSON.stringify(result))
  ap.lastSeenTime = ap.lastSeenTime
    ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(ap.lastSeenTime)
    : '--'

  const { APSystem, APRadio } = ap.apStatusData || {}
  // get uptime field.
  if (APSystem && APSystem.uptime) {
    ap.uptime = formatter('longDurationFormat')(APSystem.uptime * 1000)
  } else {
    ap.uptime = '--'
  }

  // set Radio Properties fields.
  if (APRadio) {
    const apRadio24 = _.find(APRadio,
      r => r.band === ApRadioBands.band24)
    const apRadioU50 = _.find(APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 2)
    const apRadio50 = !apRadioU50 && _.find(APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 1)
    const apRadio60 = !apRadioU50 && _.find(APRadio,
      r => r.radioId === 2)
    const apRadioL50 = apRadioU50 && _.find(APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 1)

    ap.channel24 = apRadio24 as RadioProperties
    ap.channel50 = apRadio50 as RadioProperties
    ap.channelL50 = apRadioL50 as RadioProperties
    ap.channelU50 = apRadioU50 as RadioProperties
    ap.channel60 = apRadio60 as RadioProperties
  } else {
    ap.channel24 = {
      Rssi: '--',
      channel: '--',
      txPower: '--'
    } as RadioProperties
    ap.channel50 = {
      Rssi: '--',
      channel: '--',
      txPower: '--'
    } as RadioProperties
  }
  return ap
}


export function isAPLowPower (afcInfo? : AFCInfo) : boolean {
  if (!afcInfo) return false
  return (
    afcInfo?.powerMode === AFCPowerMode.LOW_POWER &&
    afcInfo?.afcStatus !== AFCStatus.AFC_NOT_REQUIRED)
}
