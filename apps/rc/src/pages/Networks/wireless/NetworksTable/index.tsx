import { useIntl } from 'react-intl'

import { PageHeader, Button }                  from '@acx-ui/components'
import { NetworkTable, defaultNetworkPayload } from '@acx-ui/rc/components'
import { useNetworkListQuery }                 from '@acx-ui/rc/services'
import { Network }                             from '@acx-ui/rc/utils'
import { TenantLink }                          from '@acx-ui/react-router-dom'
import { filterByAccess }                      from '@acx-ui/user'
import { usePollingTableQuery }                from '@acx-ui/utils'

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
        extra={filterByAccess([
          <TenantLink to='/networks/wireless/add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
          </TenantLink>
        ])}
      />
      <NetworkTable tableQuery={tableQuery} selectable={true} />
    </>
  )
}
