import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  ApRadioBands,
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult
} from '@acx-ui/rc/utils'

import { ApExtraParams } from './apTypes'


export const baseApApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'apApi',
  tagTypes: ['Ap'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export interface Ap {
  apStatusData: any
}

export const apApi = baseApApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<TableResult<Ap, ApExtraParams>, RequestPayload>({
      query: ({ params, payload }) => {
        const apListReq = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return{
          ...apListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<Ap, ApExtraParams>) {
        return transformApList(result)
      }
    })
  })
})

export const {
  useApListQuery
} = apApi


const transformApList = function (result: TableResult<Ap, ApExtraParams>) {
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
      const apRadioU50 = apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
        item.band === ApRadioBands.band50 && item.radioId === 2)

      const apRadioObject = {
        apRadio24: apRadioArray.find((item: { band: ApRadioBands }) =>
          item.band === ApRadioBands.band24),
        apRadioU50: apRadioU50,
        apRadio50: !apRadioU50 &&
          apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
            item.band === ApRadioBands.band50 && item.radioId === 1),
        apRadio60: !apRadioU50 &&
          apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
            item.radioId === 2),
        apRadioL50: apRadioU50 &&
          apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
            item.band === ApRadioBands.band50 && item.radioId === 1)
      }

      const channelValue = {
        channel24: apRadioObject.apRadio24?.channel,
        channel50: apRadioObject.apRadio50?.channel,
        channelL50: apRadioObject.apRadioL50?.channel,
        channelU50: apRadioObject.apRadioU50?.channel,
        channel60: apRadioObject.apRadio60?.channel
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
