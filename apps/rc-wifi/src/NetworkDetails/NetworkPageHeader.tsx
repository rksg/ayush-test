/* eslint-disable max-len */

import { ArrowExpand, ClockOutlined, BulbOutlined } from '@acx-ui/icons'

import { Button, PageHeader } from '@acx-ui/components'

import NetworkTabs from './NetworkTabs'

function NetworkPageHeader () {
  return (
    <PageHeader
      title='Lab Network'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      extra={[
        <Button><ClockOutlined />Last 24 hours</Button>,
        <Button>Entire Organization <ArrowExpand /></Button>,
        <Button type='primary'>Configure</Button>,
        <Button><BulbOutlined /></Button>,
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
