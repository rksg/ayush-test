import { useApContext }               from '@acx-ui/rc/utils'
import { EmbeddedReport, ReportType } from '@acx-ui/reports/components'


export function ApReportsTab () {
  const { apMac } = useApContext()

  return (
    <EmbeddedReport
      reportName={ReportType.AP_DETAIL}
      rlsClause={`"apMac" in ('${apMac}')`}
    />
  )
}
