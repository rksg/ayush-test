import moment from 'moment'

import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { AdminLogTable, useAdminLogsTableQuery } from '@acx-ui/rc/components'

const AdminLogs = () => {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const earliestStart = isDateRangeLimit ? moment().subtract(3, 'month').startOf('day'): undefined
  const tableQuery = useAdminLogsTableQuery(earliestStart)
  return <AdminLogTable tableQuery={tableQuery}/>
}

export { AdminLogs }
