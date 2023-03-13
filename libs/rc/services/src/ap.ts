import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import _                             from 'lodash'

import {
  ApExtraParams,
  AP,
  PingAp,
  ApDetails,
  ApDeep,
  ApDetailHeader,
  ApGroup,
  ApRadioBands,
  CommonUrlsInfo,
  createHttpRequest,
  DhcpAp,
  onSocketActivityChanged,
  RequestPayload,
  RequestFormData,
  onActivityMessageReceived,
  TableResult,
  RadioProperties,
  WifiUrlsInfo,
  WifiApSetting,
  ApLanPort,
  APPhoto,
  ApViewModel,
  VenueDefaultApGroup,
  AddApGroup,
  CommonResult,
  PacketCaptureState,
  Capabilities,
  PacketCaptureOperationResponse,
  ApRadioCustomization,
  VenueDefaultRegulatoryChannels,
  APExtended,
  LanPortStatusProperties,
  ApDirectedMulticast,
  APNetworkSettings,
  APExtendedGrouped
} from '@acx-ui/rc/utils'
import { formatter } from '@acx-ui/utils'

export const baseApApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'apApi',
  tagTypes: ['Ap'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})

export const apApi = baseApApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<TableResult<APExtended, ApExtraParams>, RequestPayload>({
      query: ({ params, payload }) => {
        const apListReq = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return {
          ...apListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<APExtended, ApExtraParams>) {
        return transformApList(result)
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Ap', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddAps',
            'UpdateAp',
            'DeleteAp',
            'DeleteAps',
            'AddApGroupLegacy'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'LIST' }]))
          })
        })
      }
    }),
    groupByApList: build.query<TableResult<APExtendedGrouped, ApExtraParams>, RequestPayload>({
      query: ({ params, payload }) => {
        const apListReq = createHttpRequest(CommonUrlsInfo.getApGroupsListByGroup, params)
        return {
          ...apListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<APExtendedGrouped, ApExtraParams>) {
        return transformGroupByList(result)
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Ap', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddAps',
            'UpdateAp',
            'DeleteAp',
            'DeleteAps',
            'AddApGroupLegacy'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(apApi.util.invalidateTags([{ type: 'Ap', id: 'LIST' }]))
          })
        })
      }
    }),
    apGroupList: build.query<ApGroup[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApGroupList, params)
        return {
          ...req
        }
      }
    }),
    apGroupsList: build.query<TableResult<ApGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        let venueListReq = createHttpRequest(WifiUrlsInfo.getApGroupsList, params)
        if((payload as { groupBy : string })?.groupBy){
          venueListReq = createHttpRequest(WifiUrlsInfo.getApGroupsListByGroup, params)
        }
        return {
          ...venueListReq,
          body: payload
        }
      }
    }),
    getApGroup: build.query<ApGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    updateApGroup: build.mutation<ApGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    deleteApGroups: build.mutation<ApGroup[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteApGroups, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    addAp: build.mutation<ApDeep, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addAp, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    importAp: build.mutation<{}, RequestFormData>({
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
    getAp: build.query<ApDeep, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getAp, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Ap', id: 'Details' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateAp, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    deleteAp: build.mutation<AP, RequestPayload>({
      query: ({ params, payload }) => {
        const api = !!payload ? WifiUrlsInfo.deleteAps : WifiUrlsInfo.deleteAp
        const req = createHttpRequest(api, params)
        return {
          ...req,
          ...(!!payload && { body: payload })
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    addApGroup: build.mutation<AddApGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addApGroup, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    venueDefaultApGroup: build.query<VenueDefaultApGroup, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueDefaultApGroup, params)
        return {
          ...req
        }
      }
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
      query: ({ params, payload }) => {
        const api = !!payload ? WifiUrlsInfo.deleteSoloAps : WifiUrlsInfo.deleteSoloAp
        const req = createHttpRequest(api, params)
        return {
          ...req,
          ...(!!payload && { body: payload })
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
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getAp, params)
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.rebootAp, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    factoryResetAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.factoryResetAp, params)
        return {
          ...req
        }
      }
    }),
    blinkLedAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.blinkLedAp, params)
        return{
          ...req,
          body: payload
        }
      }
    }),

    pingAp: build.mutation<PingAp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.pingAp, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    traceRouteAp: build.mutation<PingAp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.traceRouteAp, params)
        return {
          ...req,
          body: payload
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
      }
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

    startPacketCapture: build.mutation<PacketCaptureOperationResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.startPacketCapture, params)
        return {
          ...req,
          body: payload
        }
      }
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
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApDirectedMulticast, params)
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApDirectedMulticast, params)
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'DIRECTED_MULTICAST' }]
    }),
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
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApNetworkSettings, params)
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApNetworkSettings, params)
        return{
          ...req,
          body: payload
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
    })


  })
})

export const {
  useApListQuery,
  useGroupByApListQuery,
  useLazyApListQuery,
  useApDetailHeaderQuery,
  useApViewModelQuery,
  useApDetailsQuery,
  useApLanPortsQuery,
  useAddApMutation,
  usePingApMutation,
  useTraceRouteApMutation,
  useGetApQuery,
  useLazyGetApQuery,
  useUpdateApMutation,
  useAddApGroupMutation,
  useApGroupListQuery,
  useLazyApGroupListQuery,
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
  useGetApCapabilitiesQuery,
  useLazyGetApCapabilitiesQuery,
  useUpdateApCustomizationMutation,
  useResetApCustomizationMutation,
  useGetApValidChannelQuery,
  useGetApDirectedMulticastQuery,
  useUpdateApDirectedMulticastMutation,
  useResetApDirectedMulticastMutation,
  useGetApNetworkSettingsQuery,
  useUpdateApNetworkSettingsMutation,
  useResetApNetworkSettingsMutation,
  useDeleteApGroupsMutation,
  useUpdateApGroupMutation,
  useGetApGroupQuery
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
    channel24: true,
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
  result.data = result.data.map(item => {
    let newItem = {...item, children : [] as APExtended[], id: _.uniqueId()}
    const aps = (item as unknown as { aps: APExtended[] }).aps?.map((ap) => {
      return {
        ...ap,
        id: _.uniqueId(),
        deviceGroupName: ap.deviceGroupName !== '' ? ap.deviceGroupName : 'Uncategorized',
      };
    });
    newItem.children = aps as APExtended[]
    return newItem
  })
  return result

}

const transformApViewModel = (result: ApViewModel) => {
  const ap = JSON.parse(JSON.stringify(result))
  ap.lastSeenTime = ap.lastSeenTime ? formatter('dateTimeFormatWithSeconds')(ap.lastSeenTime) : '--'

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
