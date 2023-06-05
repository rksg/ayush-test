import { useParams } from 'react-router-dom'

import { EmbeddedReport } from '@acx-ui/reports/components'
import {
  ReportType
} from '@acx-ui/reports/components'

export function ClientReportsTab () {
  const param = useParams()
  return (
    <EmbeddedReport
      reportName={ReportType.CLIENT_DETAIL}
      rlsClause={`"clientMac" in ('${param?.clientId?.toUpperCase()}')`}
    />
  )
}