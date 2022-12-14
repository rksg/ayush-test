import { useIntl } from 'react-intl'

import { ReportHeader }  from '../ReportHeader'
import EmbeddedDashboard from '../Reports/EmbeddedDashboard'

import {
  ReportType,
  reportTypeLabelMapping,
  reportTypeDataStudioMapping } from './reportsMapping'

export function Report (props: {
  type: ReportType
  withHeader?: boolean
}) {
  const { type, withHeader } = props
  const { $t } = useIntl()
  return (
    <>
      { withHeader && <ReportHeader name={$t(reportTypeLabelMapping[type])} /> }
      <EmbeddedDashboard embedDashboardName={reportTypeDataStudioMapping[type]} />
    </>
  )
}

Report.defaultProps = {
  withHeader: true
}
