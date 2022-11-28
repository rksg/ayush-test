import { useIntl } from 'react-intl'

import { ConnectedClientsTable } from '@acx-ui/rc/components'

export function ApClientsTab () {
  const { $t } = useIntl()
  return <ConnectedClientsTable />
}