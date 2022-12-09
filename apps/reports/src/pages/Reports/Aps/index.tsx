import { useIntl } from 'react-intl'

import { ReportHeader } from '../../ReportHeader'
import Report           from '../index'

export function ApsReport () {
  const { $t } = useIntl()
  return (
    <>
      <ReportHeader name={$t({ defaultMessage: 'Access Points' })}/>
      <Report embedDashboardName={'Access Points'}
      />
    </>
  )
}
