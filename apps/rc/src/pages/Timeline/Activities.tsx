import moment from 'moment'

import { getDefaultEarliestStart } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  ActivityTable,
  useActivityTableQuery
}   from '@acx-ui/rc/components'

const Activities = () => {
  const settingsId = 'timeline-activity-table'
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const earliestStart = showResetMsg ?
    moment().subtract(3, 'month').startOf('day'):
    getDefaultEarliestStart()
  const tableQuery = useActivityTableQuery(
    undefined,
    { settingsId },
    earliestStart
  )

  return <ActivityTable settingsId={settingsId} tableQuery={tableQuery} />
}

export { Activities }
