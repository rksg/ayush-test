import { EventTable, useEventsTableQuery } from '@acx-ui/rc/components'

const Events = () => {
  const tableQuery = useEventsTableQuery()
  return <EventTable tableQuery={tableQuery}/>
}
export { Events }
