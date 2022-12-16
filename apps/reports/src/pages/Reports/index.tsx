import { useIntl } from 'react-intl'

import { ReportHeader }  from '../ReportHeader'
import EmbeddedDashboard from '../Reports/EmbeddedDashboard'

import {
  ReportType,
  reportTypeLabelMapping,
  reportTypeDataStudioMapping,
  reportTypeModeMapping } from './reportsMapping'

export function Report (props: {
  type: ReportType
  withHeader?: boolean
}) {
  const { type, withHeader } = props
  const { $t } = useIntl()
  const shouldHideBand = ['app','ap'].includes(type)
  return (
    <>
      { withHeader && <ReportHeader name={$t(reportTypeLabelMapping[type])}
        mode={reportTypeModeMapping[type]}
        shouldHideBand={shouldHideBand}/> }
      <EmbeddedDashboard embedDashboardName={reportTypeDataStudioMapping[type]} />
    </>
  )
}

Report.defaultProps = {
  withHeader: true
}
