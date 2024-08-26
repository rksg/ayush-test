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
  border: 1px solid #dedede;
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
    background: #f5f5f5;
    color: #5496EA;
  }
`

const excludedIcons = [
  'R1Cloud',
  'MelissaHeaderIcon',
  'MelissaIcon',
  'SearchResultNoData'
]

export function Basic () {
  const [searchText, setSearchText] = useState('')
  const allIcons = Object.keys(Icons).filter(name => !excludedIcons.includes(name))

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
        .map((iconName, index) => {
          const Icon = Icons[iconName]
          return <IconWrapper key={index}>
            <Icon />
            <div className='name' title={iconName}>{ iconName }</div>
          </IconWrapper>
        })
    }</IconList>
  </div>)
}
