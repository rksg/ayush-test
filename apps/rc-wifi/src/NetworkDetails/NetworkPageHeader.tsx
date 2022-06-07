/* eslint-disable max-len */

import { BulbOutlined, ClockCircleOutlined } from '@ant-design/icons'

import { Button, PageHeader } from '@acx-ui/components'

import NetworkTabs from './NetworkTabs'

function NetworkPageHeader () {
  return (
    <PageHeader
      title='Lab Network'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      extra={<>
        <Button><ClockCircleOutlined />Last 24 hours</Button>
        <Button>Entire Organization</Button>
        <Button type='primary'>Configure</Button>
        <Button><BulbOutlined /></Button>
      </>}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
