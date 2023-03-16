import { FetchBaseQueryError }       from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { Filter } from '@acx-ui/components'
import {
  Activity,
  EventBase,
  EventMeta,
  Event,
  AdminLogBase,
  AdminLogMeta,
  AdminLog,
  createHttpRequest,
  CommonUrlsInfo,
  TableResult,
  RequestPayload,
  onSocketActivityChanged,
  downloadFile,
  SEARCH,
  SORTER
} from '@acx-ui/rc/utils'

import { getMetaList } from './utils'

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
  'recipientName'
]

export const baseTimelineApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'timelineApi',
  tagTypes: ['Activity', 'Event', 'AdminLog'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export type EventsExportPayload = {
  clientDateFormat: string
  clientTimeZone: string
  detailLevel: string
  eventsPeriodForExport: {
    fromTime: string
    toTime: string
  }
  fields: string[]
  filters: Filter
  isSupport: boolean
  tenantId: string
} & SEARCH & SORTER

export const timelineApi = baseTimelineApi.injectEndpoints({
  endpoints: (build) => ({
    activities: build.query<TableResult<Activity>, RequestPayload>({
      providesTags: [{ type: 'Activity', id: 'LIST' }],
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const activityListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getActivityList, arg.params),
          body: arg.payload
        }
        const baseListQuery = await fetchWithBQ(activityListInfo)
        const baseList = baseListQuery.data as TableResult<Activity>
        return baseList
          ? { data: baseList }
          : { error: baseListQuery.error as FetchBaseQueryError }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, () => {
          api.dispatch(timelineApi.util.invalidateTags([{ type: 'Activity', id: 'LIST' }]))
        })
      }
    }),
    events: build.query<TableResult<Event>, RequestPayload>({
      providesTags: [{ type: 'Event', id: 'LIST' }],
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const eventListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventList, arg.params),
          body: arg.payload
        }
        const baseListQuery = await fetchWithBQ(eventListInfo)
        const baseList = baseListQuery.data as TableResult<EventBase>
        if(!baseList) return { error: baseListQuery.error as FetchBaseQueryError }

        const { data: baseListData } = baseList

        const metaListInfo = getMetaList<EventBase>(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getEventListMeta, arg.params),
          fields: metaFields
        })
        const metaListQuery = await fetchWithBQ(metaListInfo)
        const metaList = metaListQuery.data as TableResult<EventMeta>
        const { data: metaListData } = metaList

        return {
          data: {
            ...baseList,
            data: baseListData.map((base) =>
              ({ ...base, ...(metaListData.find(meta=>meta.id === base.id)) })) as Event[]
          }
        }
      }
    }),
    adminLogs: build.query<TableResult<AdminLog>, RequestPayload>({
      providesTags: [{ type: 'AdminLog', id: 'LIST' }],
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const adminlogListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventList, arg.params),
          body: arg.payload
        }
        const baseListQuery = await fetchWithBQ(adminlogListInfo)
        const baseList = baseListQuery.data as TableResult<AdminLogBase>
        if(!baseList) return { error: baseListQuery.error as FetchBaseQueryError }

        const { data: baseListData } = baseList

        const metaListInfo = getMetaList<AdminLogBase>(baseList, {
          urlInfo: createHttpRequest(CommonUrlsInfo.getEventListMeta, arg.params),
          fields: metaFields
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
              ...(metaListData.find(meta=>meta.id === base.id))
            })) as AdminLog[]
          }
        }
      }
    }),
    downloadEventsCSV: build.mutation<Blob, EventsExportPayload>({
      query: (payload) => {
        const req = createHttpRequest(CommonUrlsInfo.downloadCSV,
          { tenantId: payload.tenantId }
        )
        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'download.csv'
            downloadFile(response, fileName)
          }
        }
      }
    })
  })
})

export const {
  useActivitiesQuery,
  useEventsQuery,
  useAdminLogsQuery,
  useDownloadEventsCSVMutation
} = timelineApi
