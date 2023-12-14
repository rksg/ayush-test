import { Space } from 'antd'

import { Select } from '..'

import { defaultProps, defaultOption } from './stories'

export function WithOptGroup () {
  return <Space>
    <p>Single:</p>
    <Select
      {...defaultProps}
    >
      <Select.OptGroup
        key='group1'
        label='Group 1'
        children={defaultOption?.map(option => <Select.Option
          key={option.value}
          value={option.value}
          children={option.label}
        />)}
      />
      <Select.OptGroup
        key='group2'
        label='Group 2'
        children={defaultOption?.map(option => <Select.Option
          key={option.value * 4}
          value={option.value * 4}
          children={option.label}
        />)}
      />
    </Select>
  </Space>
}
