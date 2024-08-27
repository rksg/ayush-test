import { useState } from 'react'

import { Divider, Input, Space, Typography } from 'antd'
import styled                                from 'styled-components'

import * as Icons from '@acx-ui/icons-new'

import { Button } from '../../Button'

export const IconList = styled(Space)`
  flex-flow: wrap;
  padding: .6em 0 2em;
`

export const IconWrapper = styled(Space)`
  flex-direction: column;
  min-width: 150px;
  min-height: 50px;
  justify-content: center;

  p {
    max-width: 120px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.svg16 {
    svg {
      width: 16px !important;
      height: 16px !important;
    }
  }
  &.svg24 {
    svg {
      width: 24px !important;
      height: 24px !important;
    }
  }
  &.svg32 {
    svg {
      width: 32px !important;
      height: 32px !important;
    }
  }
`

export function WithButton () {
  const [searchText, setSearchText] = useState('')
  const allIcons = Object.keys(Icons)

  return (<div>
    <Typography.Title level={4} strong>Icons:</Typography.Title>
    <Space style={{ marginBottom: '8px' }}>
      Search: <Input placeholder='Search by icon name...'
        onChange={(e) => { setSearchText(e.target.value) }}
      />
    </Space>
    <IconList>{
      allIcons
        .filter(name => !!searchText ? name.includes(searchText) : name)
        .map((iconName) => {
          const Icon = Icons[iconName]
          return <div>
            <Divider orientation='left' plain>{ iconName }</Divider>
            <Space>
              <IconWrapper key={`${iconName}-link-16`} className='svg16' title='16px'>
                <Button type='link' icon={<Icon size='sm' />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-link-24`} className='svg24' title='24px'>
                <Button type='link' icon={<Icon />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-link-32`} className='svg32' title='32px'>
                <Button type='link' icon={<Icon />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-disabled-link-32`} className='svg32' title='32px'>
                <Button type='link' disabled icon={<Icon />}>Text</Button>
              </IconWrapper>

              <IconWrapper key={`${iconName}-default-16`} className='svg16' title='16px'>
                <Button type='default' icon={<Icon size='sm' />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-default-24`} className='svg24' title='24px'>
                <Button type='default' icon={<Icon />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-default-32`} className='svg32' title='32px'>
                <Button type='default' icon={<Icon />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-disabled-default-32`} className='svg32' title='32px'>
                <Button type='default' disabled icon={<Icon />}>Text</Button>
              </IconWrapper>

              <IconWrapper key={`${iconName}-primary-16`} className='svg16' title='16px'>
                <Button type='primary' icon={<Icon size='sm' />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-primary-24`} className='svg24' title='24px'>
                <Button type='primary' icon={<Icon />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-primary-32`} className='svg32' title='32px'>
                <Button type='primary' icon={<Icon />}>Text</Button>
              </IconWrapper>
              <IconWrapper key={`${iconName}-disabled-primary-32`} className='svg32' title='32px'>
                <Button type='primary' disabled icon={<Icon />}>Text</Button>
              </IconWrapper>
            </Space>
          </div>
        })
    }
    </IconList>
  </div>)
}
