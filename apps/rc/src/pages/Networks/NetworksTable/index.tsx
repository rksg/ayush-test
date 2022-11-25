import { PageHeader, Button } from 'antd'
import { useIntl }            from 'react-intl'

import { NetworkTable }                           from '@acx-ui/rc/components'
import { useNetworkListQuery }                    from '@acx-ui/rc/services'
import { useTableQuery, Network, RequestPayload } from '@acx-ui/rc/utils'
import { TenantLink }                             from '@acx-ui/react-router-dom'


export default function NetworksTable () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery<Network, RequestPayload<unknown>, unknown>({
    useQuery: useNetworkListQuery,
    defaultPayload: NetworkTable.defaultNetworkPayload
  })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Networks' })}
        extra={[
          <TenantLink to='/networks/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
          </TenantLink>
        ]}
      />
      <NetworkTable tableQuery={tableQuery}/>
    </>
  )
}
