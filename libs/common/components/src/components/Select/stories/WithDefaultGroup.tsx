import { Space } from 'antd'

import { Select } from '..'

import { defaultProps, defaultGroupOption } from './stories'

export function WithDefaultGroup () {
  return <Space>
    <div>
      <p>Single:</p>
      <Select
        {...defaultProps}
        options={defaultGroupOption}
      />
    </div>
    <div>
      <p>Multiple:</p>
      <Select
        {...defaultProps}
        mode='multiple'
        options={defaultGroupOption}
      />
    </div>
  </Space>
}
