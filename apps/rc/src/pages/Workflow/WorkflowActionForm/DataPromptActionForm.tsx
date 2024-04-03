import React from 'react'

import {  Form, Input } from 'antd'
import { useIntl }      from 'react-intl'

import { whitespaceOnlyRegExp } from '@acx-ui/rc/utils'


export function DataPromptActionForm () {
  const { $t } = useIntl()


  return (
    <>
      <Form.Item
        name='title'
        label={$t({ defaultMessage: 'Title' })}
        rules={[
          { required: true },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name='messageHtml'
        label={$t({ defaultMessage: 'Message HTML' })}
        rules={[
          { required: true },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
      >
        <Input.TextArea rows={8} />
      </Form.Item>
    </>
  )
}
