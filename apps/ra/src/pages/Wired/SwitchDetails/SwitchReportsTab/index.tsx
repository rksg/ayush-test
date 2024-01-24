import { useParams }      from '@acx-ui/react-router-dom'
import { EmbeddedReport } from '@acx-ui/reports/components'
import {
  ReportType
} from '@acx-ui/reports/components'


export function SwitchReportsTab () {
  const { switchId } = useParams()

  return (
    <EmbeddedReport
      reportName={ReportType.SWITCH_DETAIL}
      rlsClause={`"switchId" in ('${switchId}')`} />
  )
}
