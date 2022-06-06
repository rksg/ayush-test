import { FetchBaseQueryError }       from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  ApiInfo,
  createHttpRequest,
  CommonUrlsInfo,
  TableResult,
  RequestPayload
} from '@acx-ui/rc/utils'

import { Alarm, AlarmBase, AlarmMeta } from './types'

export const baseEventAlarmApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'eventAlarmApi',
  tagTypes: ['Alarms'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const eventAlarmApi = baseEventAlarmApi.injectEndpoints({
  endpoints: (build) => ({
    alarmsList: build.query<TableResult<Alarm>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const alarmsListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getAlarmsList, arg.params),
          body: arg.payload
        }
        const baseListQuery = await fetchWithBQ(alarmsListInfo)
        const baseList = baseListQuery.data as TableResult<AlarmBase>

        const metaListInfo = getMetaList(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getAlarmsListMeta, arg.params),
          fields: ['venueName', 'apName', 'switchName']
        })
        const metaListQuery = await fetchWithBQ(metaListInfo)
        const metaList = metaListQuery.data as TableResult<AlarmMeta>

        const aggregatedList = getAggregatedList(baseList, metaList)
        return metaListQuery.data
          ? { data: aggregatedList }
          : { error: metaListQuery.error as FetchBaseQueryError }
      }
    })
  })
})
export const {
  useAlarmsListQuery
} = eventAlarmApi


export const getMetaList = function (
  list: TableResult<AlarmBase>,
  metaListInfo: { urlInfo: ApiInfo, fields: string[]}
) {
  const httpRequest = metaListInfo.urlInfo
  const body = {
    fields: metaListInfo.fields,
    filters: {
      id: list.data.map((item: { id: string }) => item.id)
    }
  }
  return {
    ...httpRequest, body
  }
}

export const getAggregatedList = function (
  baseList: TableResult<AlarmBase>,
  metaList: TableResult<AlarmMeta>
): TableResult<Alarm> {
  return {
    ...baseList,
    data: baseList.data.map((base) => {
      let message = JSON.parse(base.message).message_template
      let msgMeta = metaList.data.find((d) => d.id === base.id)
      const result = { ...base, ...msgMeta } as Alarm
      const placeholder = '@@'
      const matches = message.match(new RegExp(`${placeholder}\\w+`, 'g'))
      for (const match of matches) {
        const key = match.replace(placeholder, '') as keyof Alarm
        message = message.replace(match, result[key])
      }
      result.message = message
      return result
    })
  }
}
