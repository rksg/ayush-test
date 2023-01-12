import { useParams } from 'react-router-dom'

import { useApViewModelQuery }  from '@acx-ui/rc/services'
import { EmbeddedReport }       from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'


export function ApReportsTab () {
  const params = useParams()
  const apViewModelPayload = {
    fields: ['apMac'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const { data: currentAP }= useApViewModelQuery({
    params, payload: apViewModelPayload
  })

  return (
    <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.AP_DETAIL]}
      rlsClause={`"apMac" in ('${currentAP?.apMac}')`}
    />
  )
}
