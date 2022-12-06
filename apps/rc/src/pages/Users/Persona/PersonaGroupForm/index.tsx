import React, { useEffect } from 'react'

import { Col, Form, FormInstance, Input, Row, Select, Space } from 'antd'
import TextArea                                               from 'antd/lib/input/TextArea'
import { useIntl }                                            from 'react-intl'

import { Button, Subtitle }               from '@acx-ui/components'
import { useMacRegListsQuery }            from '@acx-ui/rc/services'
import { PersonaGroup, useNewTableQuery } from '@acx-ui/rc/utils'



export function PersonaGroupForm (props: {
  form: FormInstance,
  defaultValue?: PersonaGroup
}) {
  const { $t } = useIntl()
  const { form, defaultValue } = props

  const macRegistrationPoolList = useNewTableQuery({
    useQuery: useMacRegListsQuery,
    apiParams: { size: '2147483647', page: '0' },
    defaultPayload: { }
  })

  useEffect(() => {
    if (defaultValue) {
      form.setFieldsValue(defaultValue)
    }
  }, [defaultValue])

  return (
    <Form
      form={form}
      layout={'vertical'}
      name={'personaGroupForm'}
      initialValues={defaultValue}
    >
      <Space direction={'vertical'} size={16} style={{ display: 'flex' }}>
        <Row>
          <Col span={21}>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Persona Group Name' })}
              rules={
                [{ required: true }]
              }
              children={<Input />}
            />
            <Form.Item
              name='description'
              label={$t({ defaultMessage: 'Description' })}
              children={<TextArea rows={3} maxLength={64} />}
            />
          </Col>
        </Row>
        <Row align={'middle'} gutter={8}>
          <Col span={24}>
            <Subtitle level={4}>{$t({ defaultMessage: 'Services' })}</Subtitle>
          </Col>
          <Col span={21}>
            <Form.Item label={'DPSK Pool'}>
              <Form.Item
                name='dpskPoolId'
                children={
                  <Select
                    disabled={!!defaultValue?.dpskPoolId}
                    placeholder={$t({ defaultMessage: 'Select...' })}
                    options={[]}
                  />
                }
                rules={
                  // TODO: required=true if DPSK pool supported.
                  [{
                    required: false,
                    message: $t({ defaultMessage: 'Please select a DPSK pool' })
                  }]
                }
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Button type={'link'}>{$t({ defaultMessage: 'Add' })}</Button>
          </Col>
          <Col span={21}>
            <Form.Item
              name='macRegistrationPoolId'
              valuePropName='value'
              label={$t({ defaultMessage: 'MAC Registration List' })}
              children={
                <Select
                  allowClear
                  disabled={!!defaultValue?.macRegistrationPoolId}
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={
                    macRegistrationPoolList.data?.content
                      .map(pool => ({ value: pool.id, label: pool.name }))
                  }
                />
              }
            />
          </Col>
          <Col span={2}>
            <Button type={'link'}>{$t({ defaultMessage: 'Add' })}</Button>
          </Col>
        </Row>
      </Space>
    </Form>
  )
}
