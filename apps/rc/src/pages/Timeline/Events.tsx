import { EventTable, useEventsTableQuery } from '@acx-ui/rc/components'
import { LoadTimeProvider, TrackingPages } from '@acx-ui/utils'

const Events = () => {
  const settingsId = 'timeline-event-table'
  const tableQuery = useEventsTableQuery(
    undefined,
    undefined,
    { settingsId }
  )
  return <LoadTimeProvider page={TrackingPages.EVENTS}>
    <EventTable
      settingsId={settingsId}
      tableQuery={tableQuery}
      showScheduleExport={true}/>
  </LoadTimeProvider>
}
export { Events }
