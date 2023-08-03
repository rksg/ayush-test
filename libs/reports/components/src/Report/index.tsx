import { useIntl } from 'react-intl'

import { EmbeddedReport }  from '../EmbeddedReport'
import {
  ReportType,
  reportTypeLabelMapping
} from '../mapping/reportsMapping'
import { ReportHeader } from '../ReportHeader'


export function Report (props: {
  type: ReportType
  withHeader?: boolean
  showFilter?: boolean
}) {
  const { type, withHeader, showFilter } = props
  const { $t } = useIntl()

  return (
    <>
      { withHeader && <ReportHeader
        name={$t(reportTypeLabelMapping[type])}
        showFilter={showFilter}
        type={type}
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
