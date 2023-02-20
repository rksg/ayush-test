import { useEffect } from 'react'

import moment from 'moment-timezone'

import { AdminLogTable }     from '@acx-ui/rc/components'
import { useAdminLogsQuery } from '@acx-ui/rc/services'
import {
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  AdminLog,
  CommonUrlsInfo,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { useDateFilter } from '@acx-ui/utils'

const AdminLogs = () => {
  const { startDate, endDate } = useDateFilter()

  const tableQuery = usePollingTableQuery<AdminLog>({
    useQuery: useAdminLogsQuery,
    defaultPayload: {
      url: CommonUrlsInfo.getEventList.url,
      fields: [
        'event_datetime',
        'severity',
        'entity_type',
        'entity_id',
        'message',
        'apMac',
        'clientMac',
        'apName',
        'switchName',
        'serialNumber',
        'networkName',
        'networkId',
        'ssid',
        'radio',
        'raw_event',
        'product',
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
        'transactionId'
      ],
      filters: {
        entity_type: ['ADMIN', 'NOTIFICATION']
      }
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    },
    search: {
      searchTargetFields: ['entity_id', 'message']
    },
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })

  useEffect(()=>{
    const payload = tableQuery.payload as { filters?: Record<string, string[]> }
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        ...payload.filters,
        fromTime: moment(startDate).utc().format(),
        toTime: moment(endDate).utc().format()
      }
    })
  }, [startDate, endDate])

  return <AdminLogTable tableQuery={tableQuery}/>
}

export { AdminLogs }
