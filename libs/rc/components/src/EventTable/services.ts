import { useEffect } from 'react'

import { useAdminLogsQuery, useEventsQuery } from '@acx-ui/rc/services'
import {
  Event,
  CommonUrlsInfo,
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  usePollingTableQuery,
  AdminLog
} from '@acx-ui/rc/utils'
import { useUserProfileContext } from '@acx-ui/user'
import { useDateFilter }         from '@acx-ui/utils'

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
    'detailedDescription'
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

function useQueryFilter () {
  const { dateFilter } = useDateFilter()
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
  pollingInterval = TABLE_QUERY_LONG_POLLING_INTERVAL
) {
  const { detailLevel, skip, dateFilter } = useQueryFilter()
  const filters = { ...baseFilters, dateFilter }

  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
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

export function useAdminLogsTableQuery () {
  const { detailLevel, skip, dateFilter } = useQueryFilter()
  const pollingInterval = TABLE_QUERY_LONG_POLLING_INTERVAL

  const tableQuery = usePollingTableQuery<AdminLog>({
    useQuery: useAdminLogsQuery,
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
