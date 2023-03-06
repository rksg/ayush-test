import { useIntl } from 'react-intl'

import { EmbeddedReport } from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeLabelMapping,
  reportTypeDataStudioMapping,
  reportTypeModeMapping } from '@acx-ui/reports/components'

import { ReportHeader } from '../ReportHeader'

export function Report (props: {
  type: ReportType
  withHeader?: boolean
  showFilter?: boolean
}) {
  const { type, withHeader, showFilter } = props
  const { $t } = useIntl()
  const isRadioBandDisabled = [
    ReportType.APPLICATION,
    ReportType.ACCESS_POINT,
    ReportType.AIRTIME_UTILIZATION
  ].includes(type)
  let radioBandDisabledReason = isRadioBandDisabled ?
    $t({ defaultMessage: 'Radio Band is not available for this report.' }) : ''

  return (
    <>
      { withHeader && <ReportHeader name={$t(reportTypeLabelMapping[type])}
        mode={reportTypeModeMapping[type]}
        isRadioBandDisabled={isRadioBandDisabled}
        radioBandDisabledReason={radioBandDisabledReason}
        showFilter={showFilter}
      /> }
      <EmbeddedReport embedDashboardName={reportTypeDataStudioMapping[type]} hideHeader={false} />
    </>
  )
}

Report.defaultProps = {
  withHeader: true,
  showFilter: true
}
