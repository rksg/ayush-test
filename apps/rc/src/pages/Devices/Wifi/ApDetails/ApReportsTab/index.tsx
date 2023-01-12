import { EmbeddedReport }       from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'

import { useApContext } from '../ApContext'

export function ApReportsTab () {
  const { apMac } = useApContext()

  return (
    <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.AP_DETAIL]}
      rlsClause={`"apMac" in ('${apMac}')`}
    />
  )
}
