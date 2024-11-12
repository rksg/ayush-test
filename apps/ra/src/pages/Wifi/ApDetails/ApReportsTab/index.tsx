import { useParams }                  from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType } from '@acx-ui/reports/components'


export function ApReportsTab () {
  const { apId } = useParams()

  return (
    <EmbeddedReport
      reportName={ReportType.AP_DETAIL}
      rlsClause={`"apMac" in ('${apId?.toUpperCase()}')`}
    />
  )
}
