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
import { useUserProfileContext } from '@acx-ui/user'
import { useDateFilter }         from '@acx-ui/utils'

function useQueryDateFilter () {
  const { startDate, endDate } = useDateFilter()
  return {
    fromTime: moment(startDate).utc().format(),
    toTime: moment(endDate).utc().format()
  }
}

function useAdminLogsTableQuery () {
  const { fromTime, toTime } = useQueryDateFilter()
  const detailLevel = useUserProfileContext().data.detailLevel
  const filters = { entity_type: ['ADMIN', 'NOTIFICATION'], fromTime, toTime }

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
      filters,
      detailLevel
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    },
    search: {
      searchTargetFields: ['entity_id', 'message']
    },
    option: {
      skip: !Boolean(detailLevel),
      pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL
    }
  })

  useEffect(()=>{
    const payload = tableQuery.payload as { filters?: Record<string, string[]> }
    tableQuery.setPayload({
      ...tableQuery.payload,
      detailLevel,
      filters: { ...payload.filters, ...filters }
    })
  }, [fromTime, toTime, detailLevel])

  return tableQuery
}

const AdminLogs = () => {
  const tableQuery = useAdminLogsTableQuery()
  return <AdminLogTable tableQuery={tableQuery}/>
}

export { AdminLogs }
