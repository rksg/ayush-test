import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import {
  Alarm,
  AlarmBase,
  AlarmMeta,
  CommonUrlsInfo,
  TableResult,
  CommonResult,
  Dashboard,
  CommonRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { baseEventAlarmApi } from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { getMetaList } from './utils'

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

        const payloadFilters = arg.payload as { filters: { [key: string]: unknown; } }
        const alarmTypeFilter = 'alarmType' in payloadFilters.filters ?
          (payloadFilters.filters['alarmType'] as string[]) : undefined

        const metaListInfo = getMetaList<AlarmBase>(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getAlarmsListMeta, arg.params),
          fields: ['venueName', 'apName', 'switchName', 'edgeName'],
          ...(alarmTypeFilter && { filters: { alarmType: alarmTypeFilter } })
        })
        const metaListQuery = await fetchWithBQ(metaListInfo)
        const metaList = metaListQuery.data as TableResult<AlarmMeta>

        const aggregatedList = getAggregatedList(baseList, metaList)
        return metaListQuery.data
          ? { data: aggregatedList }
          : { error: metaListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Alarms', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    clearAlarm: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.clearAlarm, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Alarms', id: 'LIST' }, { type: 'Alarms', id: 'OVERVIEW' }]
    }),
    clearAlarmByVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.clearAlarmByVenue, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Alarms', id: 'LIST' }, { type: 'Alarms', id: 'OVERVIEW' }]
    }),
    clearAllAlarms: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.clearAllAlarms, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Alarms', id: 'LIST' }, { type: 'Alarms', id: 'OVERVIEW' }]
    }),
    getAlarmCount: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getDashboardV2Overview, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Alarms', id: 'OVERVIEW' }]
    }),
    getAlarmsCount: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getAlarmSummaries, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Alarms', id: 'OVERVIEW' }]
    })
  })
})
export const {
  useAlarmsListQuery,
  useClearAlarmMutation,
  useClearAlarmByVenueMutation,
  useClearAllAlarmsMutation,
  useGetAlarmCountQuery,
  useGetAlarmsCountQuery
} = eventAlarmApi

export const getAggregatedList = function (
  baseList: TableResult<AlarmBase>,
  metaList: TableResult<AlarmMeta>
): TableResult<Alarm> {
  return {
    ...baseList,
    data: baseList.data.map((base) => {
      try {
        let message = JSON.parse(base.message).message_template
        let msgMeta = metaList.data.find((d) => d.id === base.id)
        const result = { ...base, ...msgMeta } as Alarm
        const placeholder = '@@'
        const matches = message.match(new RegExp(`${placeholder}\\w+`, 'g')) || []
        for (const match of matches) {
          const key = match.replace(placeholder, '') as keyof Alarm
          message = message.replace(match, result[key])
        }
        result.message = message
        return result
      } catch {
        let msgMeta = metaList.data.find((d) => d.id === base.id)
        return { ...base, ...msgMeta } as Alarm
      }
    })
  }
}
