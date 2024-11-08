import { useState } from 'react'

import { Input, Space, Typography } from 'antd'
import styled                       from 'styled-components'

import * as Icons from '@acx-ui/icons'

export const IconList = styled(Space)`
  flex-flow: wrap;
  padding: .6em 0 2em;
`

export const IconWrapper = styled(Space)`
  width: 150px;
  height: 150px;
  flex-direction: column;
  justify-content: flex-end;
  border: 1px solid var(--acx-neutrals-30);
  padding: 35px 0;
  overflow: hidden;
  .name {
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &:hover {
    background: var(--acx-neutrals-15);
    color: var(--acx-accents-blue-50);
  }
`

const excludedIcons = [
  'R1Cloud'
]

export function Basic () {
  const [searchText, setSearchText] = useState('')
  const allIcons = Object.keys(Icons).filter(name => !excludedIcons.includes(name))

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
        .map((iconName, index) => {
          const Icon = Icons[iconName as keyof typeof Icons]
          return <IconWrapper key={index}>
            <Icon />
            <div className='name' title={iconName}>{ iconName }</div>
          </IconWrapper>
        })
    }</IconList>
  </div>)
}
