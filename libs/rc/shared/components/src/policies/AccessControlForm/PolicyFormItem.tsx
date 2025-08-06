import React from 'react'

import { Form, FormItemProps } from 'antd'

const PolicyFormItem = (props: FormItemProps) => {
  return (
    <Form.Item
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      style={{ marginBottom: '5px' }}
      {...props} />
  )
}

export default PolicyFormItem
