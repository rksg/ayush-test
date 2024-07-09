import { Space } from 'antd'

import { Select } from '..'

import { defaultProps, normalGroupOption } from './stories'

export function WithOptionGroup () {
  return <Space>
    <div>
      <p>Single:</p>
      <Select
        {...defaultProps}
        options={normalGroupOption}
      />
    </div>
    <div>
      <p>Multiple:</p>
      <Select
        {...defaultProps}
        mode='multiple'
        options={normalGroupOption}
      />
    </div>
  </Space>
}
