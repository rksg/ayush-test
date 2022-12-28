import { EventTable, eventDefaultPayload, eventDefaultSorter } from '@acx-ui/rc/components'
import { useEventsQuery }                                      from '@acx-ui/rc/services'
import { Event, useTableQuery, RequestPayload }                from '@acx-ui/rc/utils'

const Events = () => {
  const tableQuery = useTableQuery<Event, RequestPayload<unknown>, unknown>({
    useQuery: useEventsQuery,
    defaultPayload: eventDefaultPayload,
    sorter: eventDefaultSorter
  })
  return <EventTable tableQuery={tableQuery}/>
}
export { Events }
