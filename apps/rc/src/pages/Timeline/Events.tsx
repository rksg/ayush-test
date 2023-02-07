import { useEffect } from 'react'

import moment from 'moment-timezone'

import {
  EventTable,
  eventDefaultPayload,
  eventDefaultSearch,
  eventDefaultSorter } from '@acx-ui/rc/components'
import { useEventsQuery } from '@acx-ui/rc/services'
import {
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  Event,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { useDateFilter } from '@acx-ui/utils'

const Events = () => {
  const { startDate, endDate } = useDateFilter()

  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: eventDefaultPayload,
    sorter: eventDefaultSorter,
    search: eventDefaultSearch,
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

  return <EventTable tableQuery={tableQuery}/>
}
export { Events }
