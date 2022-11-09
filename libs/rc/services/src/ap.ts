import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  ApExtraParams,
  AP,
  ApDeep,
  ApDetailHeader,
  ApGroup,
  APRadio,
  ApRadioBands,
  CommonUrlsInfo,
  createHttpRequest,
  onSocketActivityChanged,
  RequestPayload,
  showActivityMessage,
  TableResult,
  VenueCapabilities,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'

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
    })
  })
})

export const {
  useApListQuery,
  useLazyApListQuery,
  useApDetailHeaderQuery,
  useAddApMutation,
  useApGroupListQuery,
  useLazyApGroupListQuery,
  useWifiCapabilitiesQuery
} = apApi


const transformApList = function (result: TableResult<AP, ApExtraParams>) {
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
        apRadio24: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band24),
        apRadio50: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band50 && item.radioId === 1),
        apRadioL50: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band50 && item.radioId === 1),
        apRadioU50: apRadioArray.find((item: APRadio) =>
          item.band === ApRadioBands.band50 && item.radioId === 2),
        apRadio60: apRadioArray.find((item: APRadio) =>
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
