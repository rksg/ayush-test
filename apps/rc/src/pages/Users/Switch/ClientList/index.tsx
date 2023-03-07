import { useIntl } from 'react-intl'

import { PageHeader }         from '@acx-ui/components'
import { SwitchClientsTable } from '@acx-ui/rc/components'

export default function ClientList () {
  const { $t } = useIntl()

  return <>
    <PageHeader title={$t({ defaultMessage: 'Switch' })} />
    <SwitchClientsTable filterByVenue={true} filterBySwitch={true} />
  </>
}
