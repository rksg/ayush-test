import moment from 'moment'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ActivityTable,
  useActivityTableQuery
}   from '@acx-ui/rc/components'

const Activities = () => {
  const settingsId = 'timeline-activity-table'
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const earliestStart = isDateRangeLimit ? moment().subtract(3, 'month').startOf('day'): undefined
  const tableQuery = useActivityTableQuery(
    undefined,
    { settingsId },
    earliestStart
  )

  return <ActivityTable settingsId={settingsId} tableQuery={tableQuery} />
}

export { Activities }
