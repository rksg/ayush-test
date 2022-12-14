import { useIntl } from 'react-intl'

import { ReportHeader } from '../../ReportHeader'
import Report           from '../index'

export function ApplicationsReport () {
  const { $t } = useIntl()
  return (
    <>
      <ReportHeader name={$t({ defaultMessage: 'Applications' })}/>
      <Report embedDashboardName={'Applications'}
      />
    </>
  )
}
