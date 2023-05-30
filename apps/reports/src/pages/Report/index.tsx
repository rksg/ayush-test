import { useIntl } from 'react-intl'

import {
  EmbeddedReport,
  ReportType,
  reportTypeLabelMapping,
  reportModeMapping,
  bandDisabledReports
} from '@acx-ui/reports/components'

import { ReportHeader } from '../ReportHeader'

export function Report (props: {
  type: ReportType
  withHeader?: boolean
  showFilter?: boolean
}) {
  const { type, withHeader, showFilter } = props
  const { $t } = useIntl()
  const isRadioBandDisabled = bandDisabledReports.includes(type)
  let radioBandDisabledReason = isRadioBandDisabled ?
    $t({ defaultMessage: 'Radio Band is not available for this report.' }) : ''

  return (
    <>
      { withHeader && <ReportHeader name={$t(reportTypeLabelMapping[type])}
        mode={reportModeMapping[type]}
        isRadioBandDisabled={isRadioBandDisabled}
        radioBandDisabledReason={radioBandDisabledReason}
        showFilter={showFilter}
      /> }
      <EmbeddedReport
        reportName={type}
        hideHeader={false} />
    </>
  )
}

Report.defaultProps = {
  withHeader: true,
  showFilter: true
}
