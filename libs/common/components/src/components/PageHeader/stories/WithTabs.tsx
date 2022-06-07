import React from 'react'

import { Tabs } from 'antd'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '..'
import { Button }     from '../../Button'

export function WithTabs () {
  return <BrowserRouter>
    <PageHeader
      title='With Tabs'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      extra={[
        <Button key='1' type='primary'>Add...</Button>,
        <Button key='2'>Another Button</Button>
      ]}
      footer={
        <Tabs>
          <Tabs.TabPane tab='Overview' key='1' />
          <Tabs.TabPane tab='Devices' key='2' />
          <Tabs.TabPane tab='Venues' key='3' />
          <Tabs.TabPane tab='Clients' key='4' />
          <Tabs.TabPane tab='Policies' key='5' />
          <Tabs.TabPane tab='Events' key='6' />
        </Tabs>
      }
    />
  </BrowserRouter>
}
