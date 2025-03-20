/* eslint-disable max-len */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { Filter }              from '@acx-ui/components'
import {
  Activity,
  EventBase,
  EventMeta,
  Event,
  AdminLogBase,
  AdminLogMeta,
  AdminLog,
  CommonUrlsInfo,
  TableResult,
  ActivityIncompatibleFeatures,
  ActivityApCompatibilityExtraParams,
  onSocketActivityChanged,
  downloadFile,
  SEARCH,
  SORTER,
  EventExportSchedule,
  onActivityMessageReceived
} from '@acx-ui/rc/utils'
import { baseTimelineApi }   from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { getMetaDetailsList, getMetaList, latestTimeFilter } from './utils'

const metaFields = [
  'apName',
  'switchName',
  'networkName',
  'networkId',
  'administratorEmail',
  'venueName',
  'apGroupId',
  'apGroupName',
  'floorPlanName',
  'recipientName',
  'edgeName',
  'remoteedgeName',
  'unitName'
]

export type EventsExportPayload = {
  clientDateFormat: string
  clientTimeZone: string
  detailLevel: string
  eventsPeriodForExport: {
    fromTime: string
    toTime: string
  }
  filters: Filter
  isSupport: boolean
  tenantId: string
} & SEARCH & SORTER

export const timelineApi = baseTimelineApi.injectEndpoints({
  endpoints: (build) => ({
    activities: build.query<TableResult<Activity>, RequestPayload>({
      providesTags: [{ type: 'Activity', id: 'LIST' }],
      query (arg) {
        return {
          ...createHttpRequest(CommonUrlsInfo.getActivityList, arg.params),
          body: latestTimeFilter(arg.payload)
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, () => {
          api.dispatch(timelineApi.util.invalidateTags([{ type: 'Activity', id: 'LIST' }]))
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    activityApCompatibilities: build.query<TableResult<ActivityIncompatibleFeatures, ActivityApCompatibilityExtraParams>, RequestPayload>({
      providesTags: [{ type: 'Activity', id: 'Detail' }],
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(CommonUrlsInfo.getActivityApCompatibilitiesList, params),
          body: payload
        }
      },
      transformResponse: (res: { data: ActivityIncompatibleFeatures[], page: number, impactedCount: number, totalCount: number }) => {
        const extra = { impactedCount: res.impactedCount } as ActivityApCompatibilityExtraParams
        return { data: res.data ?? [], page: res.page, totalCount: res.totalCount, extra }
      },
      extraOptions: { maxRetries: 5 }
    }),
    events: build.query<TableResult<Event>, RequestPayload>({
      providesTags: [{ type: 'Event', id: 'LIST' }],
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const timeFilter = latestTimeFilter(arg.payload)
        const eventListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventList, arg.params),
          body: timeFilter
        }
        const baseListQuery = await fetchWithBQ(eventListInfo)
        const baseList = baseListQuery.data as TableResult<EventBase>
        if(!baseList) return { error: baseListQuery.error as FetchBaseQueryError }

        const { data: baseListData } = baseList

        const metaListInfo = getMetaList<EventBase>(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getEventListMeta, arg.params),
          fields: metaFields,
          filters: timeFilter.filters
        })
        const metaListQuery = await fetchWithBQ(metaListInfo)
        const metaList = metaListQuery.data as TableResult<EventMeta>
        const { data: metaListData } = metaList

        return {
          data: {
            ...baseList,
            data: baseListData.map((base) => ({
              ...base,
              ...{ entity_type: base.entity_type.toUpperCase() },
              ...(metaListData.find(meta=>meta.id === base.id)),
              ...{ tableKey: base.event_datetime + base.id }
            })) as Event[]
          }
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, () => {
          api.dispatch(timelineApi.util.invalidateTags([{ type: 'Event', id: 'LIST' }]))
        })
      }
    }),
    eventsNoMeta: build.query<TableResult<Event>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const timeFilter = latestTimeFilter(arg.payload)
        const eventListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventList, arg.params),
          body: timeFilter
        }
        const baseListQuery = await fetchWithBQ(eventListInfo)
        const baseList = baseListQuery.data as TableResult<EventBase>
        if(!baseList) return { error: baseListQuery.error as FetchBaseQueryError }

        const { data: baseListData } = baseList

        const metaListInfo = getMetaDetailsList<EventBase>(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getEventListDetails, arg.params),
          fields: metaFields,
          filters: timeFilter.filters
        })
        const metaListQuery = await fetchWithBQ(metaListInfo)
        const metaList = metaListQuery.data as TableResult<EventMeta>
        const { data: metaListData } = metaList

        return {
          data: {
            ...baseList,
            data: baseListData.map((base) => ({
              ...base,
              ...{ entity_type: base.entity_type.toUpperCase() },
              ...(metaListData.find(meta=>meta.id === base.id)),
              ...{ tableKey: base.event_datetime + base.id }
            })) as Event[]
          }
        }
      }
    }),
    adminLogs: build.query<TableResult<AdminLog>, RequestPayload>({
      providesTags: [{ type: 'AdminLog', id: 'LIST' }],
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const timeFilter = latestTimeFilter(arg.payload)
        const adminlogListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventList, arg.params),
          body: timeFilter
        }
        const baseListQuery = await fetchWithBQ(adminlogListInfo)
        const baseList = baseListQuery.data as TableResult<AdminLogBase>
        if(!baseList) return { error: baseListQuery.error as FetchBaseQueryError }

        const { data: baseListData } = baseList

        const metaListInfo = getMetaList<AdminLogBase>(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getEventListMeta, arg.params),
          fields: metaFields,
          filters: timeFilter.filters
        })
        const metaListQuery = await fetchWithBQ(metaListInfo)
        const metaList = metaListQuery.data as TableResult<AdminLogMeta>
        const { data: metaListData } = metaList

        return {
          data: {
            ...baseList,
            data: baseListData.map((base) => ({
              ...base,
              ...{ entity_type: base.entity_type.toUpperCase() },
              ...(metaListData.find(meta=>meta.id === base.id)),
              ...{ tableKey: base.event_datetime + base.id }
            })) as AdminLog[]
          }
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    adminLogsNoMeta: build.query<TableResult<AdminLog>, RequestPayload>({
      providesTags: [{ type: 'AdminLog', id: 'LIST' }],
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const timeFilter = latestTimeFilter(arg.payload)
        const adminlogListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventList, arg.params),
          body: timeFilter
        }
        const baseListQuery = await fetchWithBQ(adminlogListInfo)
        const baseList = baseListQuery.data as TableResult<AdminLogBase>
        if(!baseList) return { error: baseListQuery.error as FetchBaseQueryError }

        const { data: baseListData } = baseList

        const metaListInfo = getMetaDetailsList<AdminLogBase>(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getEventListDetails, arg.params),
          fields: metaFields,
          filters: timeFilter.filters
        })
        const metaListQuery = await fetchWithBQ(metaListInfo)
        const metaList = metaListQuery.data as TableResult<AdminLogMeta>
        const { data: metaListData } = metaList

        return {
          data: {
            ...baseList,
            data: baseListData.map((base) => ({
              ...base,
              ...{ entity_type: base.entity_type.toUpperCase() },
              ...(metaListData.find(meta=>meta.id === base.id)),
              ...{ tableKey: base.event_datetime + base.id }
            })) as AdminLog[]
          }
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    adminLogsOnly: build.query<TableResult<AdminLog>, RequestPayload>({
      providesTags: [{ type: 'AdminLog', id: 'LIST' }],
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const adminlogListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventList, arg.params),
          body: latestTimeFilter(arg.payload)
        }
        const baseListQuery = await fetchWithBQ(adminlogListInfo)
        const baseList = baseListQuery.data as TableResult<AdminLogBase>
        if(!baseList) return { error: baseListQuery.error as FetchBaseQueryError }

        const { data: baseListData } = baseList

        return {
          data: {
            ...baseList,
            data: baseListData.map((base) => ({
              ...base,
              ...{ entity_type: base.entity_type.toUpperCase() },
              ...{ tableKey: base.event_datetime + base.id }
            })) as AdminLog[]
          }
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    downloadEventsCSV: build.mutation<Blob, EventsExportPayload>({
      query: (payload) => {
        const req = createHttpRequest(CommonUrlsInfo.downloadCSV,
          { tenantId: payload.tenantId }
        )
        return {
          ...req,
          body: latestTimeFilter(payload),
          responseHandler: async (response: Response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'download.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),
    addExportSchedules: build.mutation<EventExportSchedule, RequestPayload>({
      query: (payload) => {
        const req = createHttpRequest(CommonUrlsInfo.addExportSchedules)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateExportSchedules: build.mutation<EventExportSchedule, RequestPayload>({
      query: (payload) => {
        const req = createHttpRequest(CommonUrlsInfo.updateExportSchedules )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Event', id: 'Detail' }]
    }),
    getExportSchedules: build.query<EventExportSchedule, RequestPayload>({
      query: () => {
        const req = createHttpRequest(CommonUrlsInfo.getExportSchedules)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Event', id: 'Detail' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'export'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(timelineApi.util.invalidateTags([{ type: 'Event', id: 'Detail' }]))
          })
        })
      }
    })
  })
})

export const {
  useActivitiesQuery,
  useActivityApCompatibilitiesQuery,
  useEventsQuery,
  useEventsNoMetaQuery,
  useAdminLogsQuery,
  useAdminLogsNoMetaQuery,
  useAdminLogsOnlyQuery,
  useDownloadEventsCSVMutation,
  useAddExportSchedulesMutation,
  useUpdateExportSchedulesMutation,
  useGetExportSchedulesQuery
} = timelineApi
