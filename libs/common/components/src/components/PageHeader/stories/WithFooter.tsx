import React from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { Button, Input }  from 'antd'

import { PageHeader } from '..'

export function WithFooter () {
  return <PageHeader
    title='With Footer'
    footer={
      <PageHeader.FooterWithDivider extra={[
        <Button>Add Network</Button>,
        <Button>Another Button</Button>
      ]}>
        <Input
          prefix={<SearchOutlined />}
          placeholder='Search'
          style={{ width: '187px' }}
        />
      </PageHeader.FooterWithDivider>
    }
  />
}
