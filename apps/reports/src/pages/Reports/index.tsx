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
  showFilter?: boolean
}) {
  const { type, withHeader, showFilter } = props
  const { $t } = useIntl()
  const isRadioBandDisabled = [ReportType.APPLICATION,ReportType.ACCESS_POINT].includes(type)
  let radioBandDisabledReason = isRadioBandDisabled ?
    $t({ defaultMessage: 'Radio Band is not available fo this report.' }) : ''

  return (
    <>
      { withHeader && <ReportHeader name={$t(reportTypeLabelMapping[type])}
        mode={reportTypeModeMapping[type]}
        isRadioBandDisabled={isRadioBandDisabled}
        radioBandDisabledReason={radioBandDisabledReason}
        showFilter={showFilter}
      /> }
      <EmbeddedDashboard embedDashboardName={reportTypeDataStudioMapping[type]} />
    </>
  )
}

Report.defaultProps = {
  withHeader: true,
  showFilter: true
}
