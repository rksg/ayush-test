import { useIntl } from 'react-intl'


import { Tabs }                                  from '@acx-ui/components'
import { useNetworkDetailHeaderQuery }           from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function NetworkTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/networks/${params.networkId}/network-details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const { data } = useNetworkDetailHeaderQuery({ params })

  const [apsCount, venuesCount, servicesCount] = [
    data?.aps.totalApCount ?? 0,
    data?.activeVenueCount ?? 0,
    0
  ]

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'APs ({apsCount})' }, { apsCount })} key='aps' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Venues ({venuesCount})' }, { venuesCount })}
        key='venues' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount })}
        key='services' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Events' })} key='events' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents' />
    </Tabs>
  )
}

export default NetworkTabs
