import { useIntl } from 'react-intl'

import { PageHeader, Button }                  from '@acx-ui/components'
import { hasAccesses }                         from '@acx-ui/rbac'
import { NetworkTable, defaultNetworkPayload } from '@acx-ui/rc/components'
import { useNetworkListQuery }                 from '@acx-ui/rc/services'
import { Network, usePollingTableQuery }       from '@acx-ui/rc/utils'
import { TenantLink }                          from '@acx-ui/react-router-dom'

export default function NetworksTable () {
  const { $t } = useIntl()
  const tableQuery = usePollingTableQuery<Network>({
    useQuery: useNetworkListQuery,
    defaultPayload: defaultNetworkPayload
  })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Networks' })}
        extra={hasAccesses([
          <TenantLink to='/networks/wireless/add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
          </TenantLink>
        ])}
      />
      <NetworkTable tableQuery={tableQuery} selectable={true} />
    </>
  )
}
