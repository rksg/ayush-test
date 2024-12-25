import { EventTable, useEventsTableQuery } from '@acx-ui/rc/components'

const Events = () => {
  const settingsId = 'timeline-event-table'
  const tableQuery = useEventsTableQuery(
    undefined,
    undefined,
    { settingsId }
  )

  return <EventTable
    settingsId={settingsId}
    tableQuery={tableQuery}
    showScheduleExport={true}
  />
}
export { Events }
