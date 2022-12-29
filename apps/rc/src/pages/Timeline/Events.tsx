import { EventTable, defaultEventsPayload } from '@acx-ui/rc/components'
import { useEventsQuery }                   from '@acx-ui/rc/services'
import {
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  Event,
  usePollingTableQuery
} from '@acx-ui/rc/utils'

const Events = () => {
  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: {
      ...defaultEventsPayload,
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
  return <EventTable tableQuery={tableQuery} />
}
export { Events }
