
import { Tabs } from 'antd'

import { useNavigate } from '@acx-ui/react-router-dom'

function NetworkTabs (props: any) {
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      pathname: `${props.pathBaseUrl}/${tab}`
    })
  return (
    <Tabs onChange={onTabChange} defaultActiveKey={props.defaultActiveKey}>
      <Tabs.TabPane tab='Overview' key='overview' />
      <Tabs.TabPane tab='APs(0)' key='aps' />
      <Tabs.TabPane tab='Venues(0)' key='venues' />
      <Tabs.TabPane tab='Services(0)' key='services' />
      <Tabs.TabPane tab='Events' key='events' />
      <Tabs.TabPane tab='Incidents' key='incidents' />
    </Tabs>
  )
}

export default NetworkTabs