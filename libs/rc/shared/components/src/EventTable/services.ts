import { useEffect } from 'react'

import { Moment } from 'moment'

import { Features, useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { useAdminLogsNoMetaQuery, useAdminLogsQuery, useEventsNoMetaQuery, useEventsQuery } from '@acx-ui/rc/services'
import {
  Event,
  CommonUrlsInfo,
  usePollingTableQuery,
  AdminLog
} from '@acx-ui/rc/utils'
import { useUserProfileContext }                            from '@acx-ui/user'
import { TABLE_QUERY_LONG_POLLING_INTERVAL, useDateFilter } from '@acx-ui/utils'

import { adminLogTypeMapping, eventTypeMapping } from './mapping'

const defaultPayload = {
  url: CommonUrlsInfo.getEventList.url,
  fields: [
    'event_datetime',
    'severity',
    'entity_type',
    'product',
    'entity_id',
    'message',
    'dpName',
    'apMac',
    'clientMac',
    'macAddress',
    'apName',
    'switchName',
    'serialNumber',
    'networkName',
    'networkId',
    'ssid',
    'radio',
    'raw_event',
    'sourceType',
    'adminName',
    'clientName',
    'userName',
    'hostname',
    'adminEmail',
    'administratorEmail',
    'venueName',
    'venueId',
    'apGroupId',
    'apGroupName',
    'floorPlanName',
    'recipientName',
    'transactionId',
    'name',
    'ipAddress',
    'detailedDescription',
    'Persona-ID',
    'duration',
    'remoteEdgeId',
    'apModel',
    'minimumRequiredVersion',
    'clientMldMac',
    'turnOnTimestamp',
    'turnOffTimestamp',
    'portList',
    'authenticationType',
    'profileName',
    'action',
    'macOui',
    'lldpTlv',
    'macAcl'
  ]
}

const defaultSorter = {
  sortField: 'event_datetime',
  sortOrder: 'DESC'
}

export const eventDefaultFilters = {
  entity_type: Object.keys(eventTypeMapping)
}

export const eventDefaultSearch = {
  searchTargetFields: ['entity_id', 'message', 'apMac', 'clientMac', 'switchMacAddress']
}

const adminLogsDefaultFilters = {
  entity_type: Object.keys(adminLogTypeMapping)
}

function useQueryFilter (earliestStart?: Moment) {
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg, earliestStart })
  const detailLevel = useUserProfileContext().data?.detailLevel
  return {
    detailLevel,
    skip: !Boolean(detailLevel),
    dateFilter
  }
}

export function useEventsTableQuery (
  baseFilters: Record<string, unknown> = {},
  search: Record<string, unknown> = eventDefaultSearch,
  pagination?: Record<string, unknown>,
  pollingInterval = TABLE_QUERY_LONG_POLLING_INTERVAL,
  earliestStart?: Moment
) {
  const { detailLevel, skip, dateFilter } = useQueryFilter(earliestStart)
  const filters = { ...baseFilters, dateFilter }
  const isReplaceMetaToggleEnabled = useIsSplitOn(Features.EVENT_ALARM_META_TIME_RANGE_TOGGLE)

  const tableQuery = usePollingTableQuery<Event>({
    useQuery: isReplaceMetaToggleEnabled ? useEventsNoMetaQuery : useEventsQuery,
    defaultPayload: {
      ...defaultPayload,
      detailLevel,
      filters: { ...eventDefaultFilters, ...filters }
    },
    pagination,
    sorter: defaultSorter,
    search,
    option: { skip, pollingInterval }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      detailLevel,
      filters: { ...(tableQuery.payload.filters as object), ...filters }
    })
  }, [dateFilter, detailLevel])

  return tableQuery
}

export function useAdminLogsTableQuery (earliestStart?: Moment) {
  const { detailLevel, skip, dateFilter } = useQueryFilter(earliestStart)
  const pollingInterval = TABLE_QUERY_LONG_POLLING_INTERVAL
  const isReplaceMetaToggleEnabled = useIsSplitOn(Features.EVENT_ALARM_META_TIME_RANGE_TOGGLE)

  const tableQuery = usePollingTableQuery<AdminLog>({
    useQuery: isReplaceMetaToggleEnabled ? useAdminLogsNoMetaQuery : useAdminLogsQuery,
    defaultPayload: {
      ...defaultPayload,
      detailLevel,
      filters: { ...adminLogsDefaultFilters, dateFilter }
    },
    sorter: defaultSorter,
    search: { searchTargetFields: ['entity_id', 'message'] },
    option: { skip, pollingInterval }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      detailLevel,
      filters: { ...(tableQuery.payload.filters as object), dateFilter }
    })
  }, [dateFilter, detailLevel])

  return tableQuery
}
