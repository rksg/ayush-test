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
  const isBandDisabled = [ReportType.APPLICATION,ReportType.ACCESS_POINT].includes(type)
  let bandDisabledReason = isBandDisabled ?
    $t({ defaultMessage: 'Radio Band is not available fo this report.' }) : ''

  return (
    <>
      { withHeader && <ReportHeader name={$t(reportTypeLabelMapping[type])}
        mode={reportTypeModeMapping[type]}
        isBandDisabled={isBandDisabled}
        bandDisabledReason={bandDisabledReason}
      /> }
      <EmbeddedDashboard embedDashboardName={reportTypeDataStudioMapping[type]} />
    </>
  )
}

Report.defaultProps = {
  withHeader: true
}
