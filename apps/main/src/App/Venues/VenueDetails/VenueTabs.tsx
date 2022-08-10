import { Tabs } from 'antd'

import { useVenueDetailsHeaderQuery }            from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function VenueTabs () {
  const params = useParams()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const { data } = useVenueDetailsHeaderQuery({ params })

  const [clientsCount, devicesCount, networksCount, servicesCount] = [
    data?.totalClientCount ?? 0,
    (data?.aps?.totalApCount ?? 0) + (data?.switches?.totalCount ?? 0),
    data?.activeNetworkCount ?? 0,
    0
  ]

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab='Overview' key='overview' />
      <Tabs.TabPane tab='AI Analytics' key='analytics' />
      <Tabs.TabPane tab={`Clients (${clientsCount})`} key='clients' />
      <Tabs.TabPane tab={`Devices (${devicesCount})`} key='devices' />
      <Tabs.TabPane tab={`Networks (${networksCount})`} key='networks' />
      <Tabs.TabPane tab={`Services (${servicesCount})`} key='services' />
      <Tabs.TabPane tab='Timeline' key='timeline' />
    </Tabs>
  )
}

export default VenueTabs
