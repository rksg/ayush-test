import { useState, useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Button }                                                 from '@acx-ui/components'
import { NetworkTabContext, NetworkTable, defaultNetworkPayload } from '@acx-ui/rc/components'
import { useNetworkListQuery }                                    from '@acx-ui/rc/services'
import { Network, usePollingTableQuery }                          from '@acx-ui/rc/utils'
import { TenantLink }                                             from '@acx-ui/react-router-dom'

export default function useNetworksTable () {
  const { $t } = useIntl()
  const [ networkCount, setNetworkCount ] = useState(0)
  const tableQuery = usePollingTableQuery<Network>({
    useQuery: useNetworkListQuery,
    defaultPayload: defaultNetworkPayload
  })

  useEffect(() => {
    setNetworkCount(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  const title = defineMessage({
    defaultMessage: 'Network List {count, select, null {} other {({count})}}',
    description: 'Translation strings - Network List'
  })

  const extra = [
    <TenantLink to='/networks/wireless/add'>
      <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
    </TenantLink>
  ]

  const component = <NetworkTabContext.Provider value={{ setNetworkCount }}>
    <NetworkTable tableQuery={tableQuery} selectable={true} />
  </NetworkTabContext.Provider>

  return {
    title: $t(title, { count: networkCount }),
    headerExtra: extra,
    component
  }
}
