import moment from 'moment'

import { getDefaultEarliestStart }           from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { EventTable, useEventsTableQuery }   from '@acx-ui/rc/components'
import { TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'

const Events = () => {
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const earliestStart = showResetMsg ?
    moment().subtract(3, 'month').startOf('day'):
    getDefaultEarliestStart()
  const settingsId = 'timeline-event-table'
  const tableQuery = useEventsTableQuery(
    undefined,
    undefined,
    { settingsId },
    TABLE_QUERY_LONG_POLLING_INTERVAL,
    earliestStart
  )
  return <EventTable
    settingsId={settingsId}
    tableQuery={tableQuery}
    showScheduleExport={true}/>
}
export { Events }
