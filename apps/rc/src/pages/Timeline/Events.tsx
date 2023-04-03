import { EventTable, useEventsTableQuery } from '@acx-ui/rc/components'

const Events = () => {
  const tableQuery = useEventsTableQuery()
  return <EventTable settingsId='timeline-event-table' tableQuery={tableQuery}/>
}
export { Events }
