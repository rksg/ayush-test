import { Button, PageHeader }                       from '@acx-ui/components'
import { ArrowExpand, ClockOutlined, BulbOutlined } from '@acx-ui/icons'

import NetworkTabs from './NetworkTabs'

function NetworkPageHeader () {
  return (
    <PageHeader
      title='Lab Network'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>Last 24 Hours</Button>,
        <Button key='hierarchy-filter'>Entire Organization <ArrowExpand /></Button>,
        <Button key='configure' type='primary'>Configure</Button>,
        <Button key='insight' icon={<BulbOutlined />} />
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
