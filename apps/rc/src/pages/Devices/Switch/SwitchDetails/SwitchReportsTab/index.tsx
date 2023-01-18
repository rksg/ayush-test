import { useParams } from 'react-router-dom'

import { useSwitchDetailHeaderQuery } from '@acx-ui/rc/services'
import { EmbeddedReport }             from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'

export function SwitchReportsTab () {
  const params = useParams()
  const switchDetailQuery = useSwitchDetailHeaderQuery({ params })

  return (
    <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.SWITCH_DETAIL]}
      rlsClause={`"switchId" in ('${switchDetailQuery?.data?.switchMac}')`}
    />
  )
}