import { useParams } from 'react-router-dom'

import { EmbeddedReport }       from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'

export function SwitchReportsTab () {
  const params = useParams()
  return (
    <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.SWITCH_DETAIL]}
      rlsClause={`"switchId" in ('${params?.switchId?.toUpperCase()}')`}
    />
  )
}