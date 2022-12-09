import { useIntl } from 'react-intl'

import { ReportHeader } from '../../ReportHeader'
import Report           from '../index'

export function SwitchesReport () {
  const { $t } = useIntl()
  return (
    <>
      <ReportHeader name={$t({ defaultMessage: 'Switches' })} />
      <Report embedDashboardName={'Switches'}
      />
    </>
  )
}
