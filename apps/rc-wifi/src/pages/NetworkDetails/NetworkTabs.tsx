import { Tabs } from 'antd'

import { useNetworkDetailHeaderQuery }           from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function NetworkTabs () {
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
      <Tabs.TabPane tab='Overview' key='overview' />
      <Tabs.TabPane tab={`APs (${apsCount})`} key='aps' />
      <Tabs.TabPane tab={`Venues (${venuesCount})`} key='venues' />
      <Tabs.TabPane tab={`Services (${servicesCount})`} key='services' />
      <Tabs.TabPane tab='Events' key='events' />
      <Tabs.TabPane tab='Incidents' key='incidents' />
    </Tabs>
  )
}

export default NetworkTabs
