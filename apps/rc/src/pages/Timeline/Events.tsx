import { useEffect } from 'react'

import moment from 'moment-timezone'

import { EventTable }     from '@acx-ui/rc/components'
import { useEventsQuery } from '@acx-ui/rc/services'
import {
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  Event,
  CommonUrlsInfo,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { useDateFilter } from '@acx-ui/utils'

const Events = () => {
  const { startDate, endDate } = useDateFilter()

  const tableQuery = usePollingTableQuery<Event>({
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
  }, [tableQuery.payload, startDate, endDate])

  return <EventTable tableQuery={tableQuery}/>
}
export { Events }
