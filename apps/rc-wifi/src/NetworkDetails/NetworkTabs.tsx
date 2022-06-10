
import { Tabs } from 'antd'

import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function NetworkTabs () {
  const { networkId, activeTab } = useParams()
  const basePath = useTenantLink(`/networks/${networkId}/network-details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane tab='Overview' key='overview' />
      <Tabs.TabPane tab='APs (0)' key='aps' />
      <Tabs.TabPane tab='Venues (0)' key='venues' />
      <Tabs.TabPane tab='Services (0)' key='services' />
      <Tabs.TabPane tab='Events' key='events' />
      <Tabs.TabPane tab='Incidents' key='incidents' />
    </Tabs>
  )
}

export default NetworkTabs
