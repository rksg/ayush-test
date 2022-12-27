import { EventTable }                                           from '@acx-ui/rc/components'
import { useEventsQuery }                                       from '@acx-ui/rc/services'
import { Event, CommonUrlsInfo, useTableQuery, RequestPayload } from '@acx-ui/rc/utils'

const Events = () => {
  const tableQuery = useTableQuery<Event, RequestPayload<unknown>, unknown>({
    useQuery: useEventsQuery,
    defaultPayload: {
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
        'name'
      ],
      filters: {
        entity_type: ['AP', 'CLIENT', 'SWITCH', 'NETWORK']
      }
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    }
  })
  return <EventTable tableQuery={tableQuery}/>
}
export { Events }
