import { useIntl } from 'react-intl'

import { ReportHeader } from '../../ReportHeader'
import Report           from '../index'

export function ClientsReport () {
  const { $t } = useIntl()
  return (
    <>
      <ReportHeader name={$t({ defaultMessage: 'Wireless Clients' })}/>
      <Report embedDashboardName={'Clients'}
      />
    </>
  )
}
