/* eslint-disable max-len */
import { useState } from 'react'

import { Divider, Input, Space, Typography } from 'antd'
import styled                                from 'styled-components'

import * as Icons from '@acx-ui/icons-new'

import { Button } from '../../Button'

export const IconList = styled(Space)`
  flex-flow: wrap;
  padding: .6em 2em 2em 0;
`

export function WithButton () {
  const [searchText, setSearchText] = useState('')
  const allIcons = Object.keys(Icons)

  return (<div>
    <Typography.Title level={4} style={{ fontWeight: 600 }}>Icons:</Typography.Title>
    <Space style={{ marginBottom: '8px' }}>
      Search: <Input placeholder='Search by icon name...'
        onChange={(e) => { setSearchText(e.target.value) }}
      />
    </Space>
    <IconList>{
      allIcons
        .filter(name => !!searchText ? name.includes(searchText) : name)
        .map((iconName) => {
          const Icon = Icons[iconName as keyof typeof Icons]
          return <div key={iconName}>
            <Divider orientation='left' plain>{ iconName }</Divider>
            <Space size={50}>
              <Button title='16px' size='small' type='link' icon={<Icon size='sm' />}>Text</Button>
              <Button title='16px' size='middle' type='link' icon={<Icon size='sm' />}>Text</Button>
              <Button title='24px' size='large' type='link' icon={<Icon style={{ width: '24px', height: '24px' }} />}>Text</Button>
              <Button title='32px' size='large' type='link' icon={<Icon size='lg' style={{ width: '32px', height: '32px' }} />} >Text</Button>
              <Button title='32px' size='large' type='link' disabled icon={<Icon size='lg' style={{ width: '32px', height: '32px' }} />}>Text</Button>

              <Button title='16px' size='small' type='default' icon={<Icon size='sm' />}>Text</Button>
              <Button title='16px' size='middle' type='default' icon={<Icon size='sm' />}>Text</Button>
              <Button title='24px' size='large' type='default' icon={<Icon style={{ width: '24px', height: '24px' }} />}>Text</Button>
              <Button title='32px' size='large' type='default' icon={<Icon size='lg' style={{ width: '32px', height: '32px' }} />}>Text</Button>
              <Button title='32px' size='large' type='default' disabled icon={<Icon size='lg' style={{ width: '32px', height: '32px' }} />}>Text</Button>

              <Button title='16px' size='small' type='primary' icon={<Icon size='sm' />}>Text</Button>
              <Button title='16px' size='middle' type='primary' icon={<Icon size='sm' />}>Text</Button>
              <Button title='24px' size='large' type='primary' icon={<Icon style={{ width: '24px', height: '24px' }} />}>Text</Button>
              <Button title='32px' size='large' type='primary' icon={<Icon size='lg' style={{ width: '32px', height: '32px' }} />}>Text</Button>
              <Button title='32px' size='large' type='primary' disabled icon={<Icon size='lg' style={{ width: '32px', height: '32px' }} />}>Text</Button>
            </Space>
          </div>
        })
    }
    </IconList>
  </div>)
}
