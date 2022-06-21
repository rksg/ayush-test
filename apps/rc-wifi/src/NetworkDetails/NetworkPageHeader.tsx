import { Button, PageHeader }                       from '@acx-ui/components'
import { ArrowExpand, ClockOutlined, BulbOutlined } from '@acx-ui/icons'

import NetworkTabs       from './NetworkTabs'
import { useGetNetwork } from './services'

function NetworkPageHeader () {
  const network = useGetNetwork()
  return (
    <PageHeader
      title={network.data?.name || ''}
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      extra={[
        <Button key='time-filter'><ClockOutlined />Last 24 hours</Button>,
        <Button key='organization'>Entire Organization <ArrowExpand /></Button>,
        <Button key='configure' type='primary'>Configure</Button>,
        <Button key='bulb'><BulbOutlined /></Button>
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
