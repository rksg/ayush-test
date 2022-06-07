
import { Tabs } from 'antd'
import styled   from 'styled-components/macro'

import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const Wrapper = styled.div`
 .ant-tabs-tab + .ant-tabs-tab {
  margin-left: 30px;
 }
`
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
    <Wrapper>
      <Tabs onChange={onTabChange} activeKey={activeTab}>
        <Tabs.TabPane tab='Overview' key='overview' />
        <Tabs.TabPane tab='APs (0)' key='aps' />
        <Tabs.TabPane tab='Venues (0)' key='venues' />
        <Tabs.TabPane tab='Services (0)' key='services' />
        <Tabs.TabPane tab='Events' key='events' />
        <Tabs.TabPane tab='Incidents' key='incidents' />
      </Tabs>
    </Wrapper>
  )
}

export default NetworkTabs
