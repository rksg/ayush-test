import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

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
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseTimelineApi } from '@acx-ui/store'

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
            data: baseListData.map((base) => ({
              ...base,
              ...{ entity_type: base.entity_type.toUpperCase() },
              ...(metaListData.find(meta=>meta.id === base.id))
            })) as Event[]
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
    })
  })
})

export const {
  useActivitiesQuery,
  useEventsQuery,
  useAdminLogsQuery
} = timelineApi
