import React, { useContext } from 'react'

import { Form, Input, Col, Radio, Row, Space, Select, DatePicker, InputNumber } from 'antd'
import { useIntl }                                                              from 'react-intl'

import { Button } from '@acx-ui/components'

import MacRegistrationListFormContext from '../MacRegistrationListFormContext'
import * as UI                        from '../styledComponents'

export function MacRegistrationListSettingForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const isExpired = Form.useWatch('listExpiration', form)
  const { data: saveData } = useContext(MacRegistrationListFormContext)

  return (
    <Row>
      <Col span={14}>
        <Form.Item name='name'
          label='Policy Name'
          rules={[
            { required: true }
          ]}
          children={<Input/>}
        />
        <Form.Item name='listExpiration' label='List Expiration' initialValue={1}>
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={1}>Never expires</Radio>
              <Space>
                <Radio value={2}>By date</Radio>
                {isExpired === 2 &&
                  <Form.Item name={'expireDate'}
                    rules={[
                      {
                        required: true,
                        message: 'Please choose date'
                      }
                    ]}>
                    <DatePicker placeholder={'Choose date'}/>
                  </Form.Item>
                }
              </Space>
              <Space>
                <Radio value={3}>After...</Radio>
                {isExpired === 3 &&
                  <>
                    <Form.Item name={'expireAfter'}
                      initialValue={1}
                      rules={[
                        { required: true, message: 'Please enter number' }
                      ]}>
                      <InputNumber/>
                    </Form.Item>
                    <Form.Item name='expireTimeUnit' initialValue={'HOURS_AFTER_TIME'}>
                      <Select>
                        <Select.Option value='HOURS_AFTER_TIME'>Hours</Select.Option>
                        <Select.Option value='DAYS_AFTER_TIME'>Days</Select.Option>
                        <Select.Option value='WEEKS_AFTER_TIME'>Weeks</Select.Option>
                        <Select.Option value='MONTHS_AFTER_TIME'>Months</Select.Option>
                        <Select.Option value='YEARS_AFTER_TIME'>Years</Select.Option>
                      </Select>
                    </Form.Item>
                  </>
                }
              </Space>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Space direction='horizontal' size={'middle'}>
          <Form.Item name={'autoCleanup'}
            valuePropName='checked'
            initialValue={true}
            label='Automatically clean expired entries'>
            <UI.CleanExpiredSwitch checkedChildren='ON'
              unCheckedChildren='OFF'
              checked={saveData.autoCleanup}
            />
          </Form.Item>
        </Space>
        <Form.Item name='defaultAccess' label='Default Access' initialValue={'accept'}>
          <Radio.Group>
            <UI.DefaultAccessRadioButton value='accept'>ACCEPT</UI.DefaultAccessRadioButton>
            <UI.DefaultAccessRadioButton value='reject'>REJECT</UI.DefaultAccessRadioButton>
          </Radio.Group>
        </Form.Item>
      </Col>
      <Col span={24}>
        <Row align={'middle'}>
          <Col span={14}>
            <Form.Item name='access_policy_set'
              label='Access Policy Set'
              rules={[
                { required: false, message: 'Please choose Access Policy Set' }
              ]}>
              <Select placeholder='Select...'>
              </Select>
            </Form.Item>
          </Col>
          <Col offset={1}>
            <Button type='link'>
              {$t({ defaultMessage: 'Add Access Policy Set' })}
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
