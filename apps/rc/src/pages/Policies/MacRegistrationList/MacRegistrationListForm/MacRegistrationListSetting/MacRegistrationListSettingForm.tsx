import { Form, Input, Col, Radio, Row, Space, Select, DatePicker, InputNumber, Switch } from 'antd'
import { useIntl }                                                                      from 'react-intl'

import { Button, SelectionControl } from '@acx-ui/components'

import { dateValidationRegExp, expirationTimeUnits } from '../../MacRegistrationListUtils'

export function MacRegistrationListSettingForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const isExpired = Form.useWatch('listExpiration', form)

  const renderExpirationSelect = () => {
    const rows = []
    for (let k in expirationTimeUnits) {
      rows.push(<Select.Option value={k}>{expirationTimeUnits[k]}</Select.Option>)
    }
    return <Select children={rows} />
  }

  return (
    <Row>
      <Col span={14}>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true }
          ]}
          children={<Input/>}
        />
        <Form.Item name='listExpiration'
          label={$t({ defaultMessage: 'List Expiration' })}
          initialValue={1}>
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={1}>Never expires</Radio>
              <Space>
                <Radio value={2}>By date</Radio>
                {isExpired === 2 &&
                  <Form.Item name='expireDate'
                    rules={[
                      {
                        required: true,
                        message: $t({ defaultMessage: 'Please enter Expiration Date' })
                      },
                      { validator: (_, value) => dateValidationRegExp(value) }
                    ]}>
                    <DatePicker name='datepicker'
                      placeholder={$t({ defaultMessage: 'Choose date' })}/>
                  </Form.Item>
                }
              </Space>
              <Space>
                <Radio value={3}>After...</Radio>
                {isExpired === 3 &&
                  <>
                    <Form.Item name='expireAfter'
                      initialValue={1}
                      rules={[
                        { required: true, message: $t({ defaultMessage: 'Please enter number' }) },
                        { type: 'number', min: 1 }
                      ]}
                      children={<InputNumber min={1} />}
                    />
                    <Form.Item name='expireTimeUnit' initialValue='HOURS_AFTER_TIME'>
                      {renderExpirationSelect()}
                    </Form.Item>
                  </>
                }
              </Space>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Space direction='horizontal' size='middle'>
          <Form.Item name='autoCleanup'
            valuePropName='checked'
            initialValue={true}
            label={$t({ defaultMessage: 'Automatically clean expired entries' })}>
            <Switch/>
          </Form.Item>
        </Space>
        <Form.Item name='defaultAccess' label={$t({ defaultMessage: 'Default Access' })}>
          <SelectionControl
            defaultValue='accept'
            options={[{ value: 'accept', label: 'ACCEPT' },
              { value: 'reject', label: 'REJECT' }]}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Row align='middle'>
          <Col span={14}>
            <Form.Item name='access_policy_set'
              label={$t({ defaultMessage: 'Access Policy Set' })}
              rules={[
                { required: false,
                  message: $t({ defaultMessage: 'Please choose Access Policy Set' }) }
              ]}>
              <Select placeholder={$t({ defaultMessage: 'Select...' })}>
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
