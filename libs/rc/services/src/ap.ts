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
  ApRadioChannelsForm,
  onSocketActivityChanged,
  RequestPayload,
  RequestFormData,
  showActivityMessage,
  TableResult,
  RadioProperties,
  WifiUrlsInfo,
  WifiApSetting,
  ApLanPort,
  ApRadio,
  APPhoto,
  ApViewModel,
  VenueCapabilities,
  VenueDefaultApGroup,
  AddApGroup,
  CommonResult,
  PacketCaptureState,
  Capabilities,
  PacketCaptureOperationResponse,
  ApRadioCustomization
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
    apList: build.query<TableResult<AP, ApExtraParams>, RequestPayload>({
      query: ({ params, payload }) => {
        const apListReq = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return {
          ...apListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<AP, ApExtraParams>) {
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
          showActivityMessage(msg, activities, () => {
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
        const venueListReq = createHttpRequest(WifiUrlsInfo.getApGroupsList, params)
        return {
          ...venueListReq,
          body: payload
        }
      }
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
          showActivityMessage(msg, activities, () => {
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
    wifiCapabilities: build.query<VenueCapabilities, RequestPayload>({
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
    apRadioCustomization: build.query<ApRadio, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApRadioCustomization, params)
        return {
          ...req
        }
      }
    }),
    rebootAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.rebootAp, params)
        return {
          ...req
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
    getApRadio: build.query<ApRadioChannelsForm, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApRadio, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    updateApRadio: build.mutation<ApRadioChannelsForm, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateApRadio, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    deleteApRadio: build.mutation<ApRadioChannelsForm, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteApRadio, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'LIST' }]
    }),
    getApCapabilities: build.query<Capabilities, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApCapabilities, params)
        return {
          ...req
        }
      }
    }),

    getApRadioCustomization: build.query<ApRadioCustomization, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getApRadioCustomization, params)
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

    blinkLedAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.blinkLedAp, params)
        return{
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
        return{
          url: `/api/tenant/${params?.tenantId}/wifi/ap/${params?.serialNumber}/picture/deep`,
          method: 'POST',
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
      }
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
  useApRadioCustomizationQuery,
  useAddApMutation,
  usePingApMutation,
  useTraceRouteApMutation,
  useGetApQuery,
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
  useLazyGetDhcpApQuery,
  useGetApPhotoQuery,
  useAddApPhotoMutation,
  useDeleteApPhotoMutation,
  useGetApRadioQuery,
  useUpdateApRadioMutation,
  useDeleteApRadioMutation,
  useGetPacketCaptureStateQuery,
  useGetApRadioCustomizationQuery,
  useStopPacketCaptureMutation,
  useStartPacketCaptureMutation,
  useGetApLanPortsQuery,
  useUpdateApLanPortsMutation,
  useGetApCapabilitiesQuery,
  useUpdateApCustomizationMutation,
  useResetApCustomizationMutation
} = apApi


const transformApList = (result: TableResult<AP, ApExtraParams>) => {
  let channelColumnStatus = {
    channel24: true,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }

  result.data = result.data.map(item => {
    if (item.apStatusData?.APRadio) {
      const apRadioArray = item.apStatusData.APRadio

      const apRadioObject = {
        apRadio24: apRadioArray.find((item: RadioProperties) =>
          item.band === ApRadioBands.band24),
        apRadio50: apRadioArray.find((item: RadioProperties) =>
          item.band === ApRadioBands.band50 && item.radioId === 1),
        apRadioL50: apRadioArray.find((item: RadioProperties) =>
          item.band === ApRadioBands.band50 && item.radioId === 1),
        apRadioU50: apRadioArray.find((item: RadioProperties) =>
          item.band === ApRadioBands.band50 && item.radioId === 2),
        apRadio60: apRadioArray.find((item: RadioProperties) =>
          item.radioId === 2)
      }

      const channelValue = {
        channel24: apRadioObject.apRadio24?.channel,
        channel50: !apRadioObject.apRadioU50 && apRadioObject.apRadio50?.channel,
        channelL50: apRadioObject.apRadioU50 && apRadioObject.apRadioL50?.channel,
        channelU50: apRadioObject.apRadioU50?.channel,
        channel60: !apRadioObject.apRadioU50 && apRadioObject.apRadio60?.channel
      }

      channelColumnStatus = {
        channel24: true,
        channel50: Boolean(channelValue.channel50) || channelColumnStatus.channel50,
        channelL50: Boolean(channelValue.channelL50) || channelColumnStatus.channelL50,
        channelU50: Boolean(channelValue.channelU50) || channelColumnStatus.channelU50,
        channel60: Boolean(channelValue.channel60) || channelColumnStatus.channel60
      }
      return { ...item, ...channelValue }
    } else {
      return item
    }
  })
  result.extra = channelColumnStatus
  return result
}

const transformApViewModel = (result: ApViewModel) => {
  const ap = JSON.parse(JSON.stringify(result))
  ap.lastSeenTime = ap.lastSeenTime ? formatter('dateTimeFormatWithSeconds')(ap.lastSeenTime) : '--'
  // get uptime field.
  if (ap.apStatusData && ap.apStatusData.APSystem && ap.apStatusData.APSystem.uptime) {
    ap.uptime = formatter('longDurationFormat')(ap.apStatusData.APSystem.uptime * 1000)
  } else {
    ap.uptime = '--'
  }

  // set Radio Properties fields.
  if (ap.apStatusData && ap.apStatusData.APRadio) {
    const apRadio24 = _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band24)
    const apRadioU50 = _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 2)
    const apRadio50 = !apRadioU50 && _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 1)
    const apRadio60 = !apRadioU50 && _.find(ap.apStatusData.APRadio,
      r => r.radioId === 2)
    const apRadioL50 = apRadioU50 && _.find(ap.apStatusData.APRadio,
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
