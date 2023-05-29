import { useState, useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { PageHeader, Button }                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { NetworkTabContext, NetworkTable, defaultNetworkPayload } from '@acx-ui/rc/components'
import { useNetworkListQuery }                                    from '@acx-ui/rc/services'
import { Network, usePollingTableQuery }                          from '@acx-ui/rc/utils'
import { TenantLink }                                             from '@acx-ui/react-router-dom'

export default function useNetworksTable () {
  const { $t } = useIntl()
  const [ networkCount, setNetworkCount ] = useState(0)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tableQuery = usePollingTableQuery<Network>({
    useQuery: useNetworkListQuery,
    defaultPayload: defaultNetworkPayload
  })

  useEffect(() => {
    setNetworkCount(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  const title = defineMessage({
    defaultMessage: 'Network List {count, select, null {} other {({count})}}' })

  const extra = [
    <TenantLink to='/networks/wireless/add'>
      <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
    </TenantLink>
  ]

  const component = <NetworkTabContext.Provider value={{ setNetworkCount }}>
    {!isNavbarEnhanced && <PageHeader
      title={$t(title, { count: null })}
      extra={extra}
    />}
    <NetworkTable tableQuery={tableQuery} selectable={true} />
  </NetworkTabContext.Provider>

  return {
    title: $t(title, { count: networkCount }),
    headerExtra: extra,
    component
  }
}
