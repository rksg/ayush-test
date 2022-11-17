import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import _                             from 'lodash'

import {
  ApExtraParams,
  AP,
  ApDetails,
  ApDeep,
  ApDetailHeader,
  ApGroup,
  ApRadioBands,
  CommonUrlsInfo,
  createHttpRequest,
  onSocketActivityChanged,
  RequestPayload,
  showActivityMessage,
  TableResult,
  RadioProperties,
  WifiUrlsInfo,
  ApLanPort,
  ApRadio,
  ApViewModel,
  VenueCapabilities,
  CommonResult
} from '@acx-ui/rc/utils'
import { getShortDurationFormat, getUserDateFormat } from '@acx-ui/utils'

export const baseApApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'apApi',
  tagTypes: ['Ap'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const apApi = baseApApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<TableResult<AP, ApExtraParams>, RequestPayload>({
      query: ({ params, payload }) => {
        const apListReq = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return{
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
            'AddAps'
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
        return{
          ...req
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
    wifiCapabilities: build.query<VenueCapabilities, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getWifiCapabilities, params)
        return{
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
    getDhcpAp: build.query<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getDhcpAp, params)
        return{
          ...req,
          body: payload
        }
      }
    }),
    downloadApLog: build.mutation<{ fileURL: string }, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.downloadApLog, params)
        return{
          ...req
        }
      }
    }),
    rebootAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.rebootAp, params)
        return{
          ...req
        }
      }
    }),
    factoryResetAp: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.factoryResetAp, params)
        return{
          ...req
        }
      }
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
  useApGroupListQuery,
  useLazyApGroupListQuery,
  useWifiCapabilitiesQuery,
  useDeleteApMutation,
  useDownloadApLogMutation,
  useRebootApMutation,
  useFactoryResetApMutation,
  useLazyGetDhcpApQuery
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
  ap.lastSeenTime = ap.lastSeenTime ? getUserDateFormat(ap.lastSeenTime, undefined, true) : '--'
  // get uptime field.
  if (ap.apStatusData && ap.apStatusData.APSystem && ap.apStatusData.APSystem.uptime) {
    ap.uptime = getShortDurationFormat(ap.apStatusData.APSystem.uptime * 1000)
  } else {
    ap.uptime = '--'
  }

  // set Radio Properties fields.
  if (ap.apStatusData && ap.apStatusData.APRadio) {
    const apRadio24 = _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band24)
    const apRadioU50 = _.find(ap.apStatusData.APRadio,
      r => r.band === ApRadioBands.band50 && r.radioId === 2)
    const apRadio50 = !apRadioU50 &&_.find(ap.apStatusData.APRadio,
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