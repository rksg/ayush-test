import { useIntl } from 'react-intl'

import { PageHeader, Button }                  from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { NetworkTable, defaultNetworkPayload } from '@acx-ui/rc/components'
import { useNetworkListQuery }                 from '@acx-ui/rc/services'
import { Network, usePollingTableQuery }       from '@acx-ui/rc/utils'
import { TenantLink }                          from '@acx-ui/react-router-dom'
import { filterByAccess }                      from '@acx-ui/user'

export default function NetworksTable () {
  const { $t } = useIntl()
  const navbarEnhancement = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tableQuery = usePollingTableQuery<Network>({
    useQuery: useNetworkListQuery,
    defaultPayload: defaultNetworkPayload
  })

  return (
    <>
      <PageHeader
        title={!navbarEnhancement && $t({ defaultMessage: 'Networks' })}
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
