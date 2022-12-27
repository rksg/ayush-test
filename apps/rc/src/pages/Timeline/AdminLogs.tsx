import { AdminLogTable }                                           from '@acx-ui/rc/components'
import { useAdminLogsQuery }                                       from '@acx-ui/rc/services'
import { AdminLog, CommonUrlsInfo, RequestPayload, useTableQuery } from '@acx-ui/rc/utils'

const AdminLogs = () => {
  const tableQuery = useTableQuery<AdminLog, RequestPayload<unknown>, unknown>({
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
    }
  })
  return <AdminLogTable tableQuery={tableQuery}/>
}

export { AdminLogs }
