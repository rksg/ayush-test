import React from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm }            from '@acx-ui/components'
import { whitespaceOnlyRegExp } from '@acx-ui/rc/utils'


export default function SplitOptionSettingForm () {
  const { $t } = useIntl()

  return (
    <Row gutter={20}>
      <Col span={24}>
        <StepsForm.Title>
          {$t({ defaultMessage: 'User Selection Split Action' })}
        </StepsForm.Title>
        <Form.Item
          name={'name'}
          label={$t({ defaultMessage: 'Name' })}
          rules={[
            { required: true }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={'description'}
          label={$t({ defaultMessage: 'Description' })}
        >
          <Input.TextArea rows={8} />
        </Form.Item>

        {/* TODO: Split content if the user want to upload the file as the template (Need HTML file) */}
        <StepsForm.Title>
          {$t({ defaultMessage: 'Webpage Display Information:' })}
        </StepsForm.Title>
        <Form.Item
          name={'title'}
          label={$t({ defaultMessage: 'Display Title' })}
          rules={[
            { required: true },
            { max: 100 },
            { validator: (_, value) => whitespaceOnlyRegExp(value) }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={'shortName'}
          label={$t({ defaultMessage: 'Short Name' })}
          rules={[
            { max: 100 },
            { validator: (_, value) => whitespaceOnlyRegExp(value) }
          ]}
        >
          <Input />
        </Form.Item>


        <Form.Item
          name={'messageHtml'}
          label={$t({ defaultMessage: 'Display Text' })}
          rules={[
            { required: true },
            { max: 1000 },
            { validator: (_, value) => whitespaceOnlyRegExp(value) }
          ]}
        >
          <Input.TextArea rows={8} />
        </Form.Item>

      </Col>
    </Row>
  )
}
