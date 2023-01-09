import { EventTable, eventDefaultPayload, eventDefaultSorter } from '@acx-ui/rc/components'
import { useEventsQuery }                                      from '@acx-ui/rc/services'
import {
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  Event,
  usePollingTableQuery
} from '@acx-ui/rc/utils'

const Events = () => {
  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: eventDefaultPayload,
    sorter: eventDefaultSorter,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })
  return <EventTable tableQuery={tableQuery} />
}
export { Events }
