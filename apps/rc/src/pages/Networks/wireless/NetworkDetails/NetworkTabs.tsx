import { useIntl } from 'react-intl'

import { Tabs }                                             from '@acx-ui/components'
import { useNetworkDetailHeaderQuery, useNetworkListQuery } from '@acx-ui/rc/services'
import { Network, usePollingTableQuery }                    from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }            from '@acx-ui/react-router-dom'
import { hasAccess }                                        from '@acx-ui/user'

function NetworkTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/networks/wireless/${params.networkId}/network-details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const { tenantId, networkId } = params
  const { data } = useNetworkDetailHeaderQuery({ params: { tenantId, networkId } })

  const [apsCount, venuesCount] = [
    data?.aps.totalApCount ?? 0,
    data?.activeVenueCount ?? 0
  ]

  const networkClientsPayload = {
    searchString: '',
    fields: [
      'id',
      'clients'
    ],
    page: 1,
    pageSize: 2048
  }

  const networkClientsQuery = usePollingTableQuery<Network>({
    useQuery: useNetworkListQuery,
    defaultPayload: networkClientsPayload
  })

  function getClientsByNetwork (){
    const currentNetworkData = networkClientsQuery?.data?.data.find(item => item.id === networkId)
    return currentNetworkData?.clients
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key='overview'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'APs ({apsCount})' }, { apsCount })} key='aps' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Venues ({venuesCount})' }, { venuesCount })}
        key='venues' />
      {/* isFFOn ? <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount })}
        key='services' /> : null */}
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
      { hasAccess() && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Incidents' })}
        key='incidents'
      /> }
      <Tabs.TabPane
        tab={
          $t({ defaultMessage: 'Clients ({clientsCount})' },
            { clientsCount: getClientsByNetwork() })
        }
        key='clients'
      />
    </Tabs>
  )
}

export default NetworkTabs
