import { useParams } from 'react-router-dom'

import { EmbeddedReport }       from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'

export function ClientReportsTab () {
  const param = useParams()
  return (
    <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.CLIENT_DETAIL]}
      rlsClause={`"clientMac" in ('${param?.clientId?.toUpperCase()}')`}
    />
  )
}