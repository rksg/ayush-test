import { useEffect } from 'react'

import { Form, Checkbox, Space, InputNumber, Row, Col } from 'antd'
import { CheckboxChangeEvent }                          from 'antd/lib/checkbox'
import { get }                                          from 'lodash'
import { useIntl }                                      from 'react-intl'

import { Tooltip }                     from '@acx-ui/components'
import { defaultIpsecFormData, Ipsec } from '@acx-ui/rc/utils'

import { messageMapping } from '../messageMapping'

export const DeadPeerDetectionDelayFormItem = (props: { editData?: Ipsec }) => {
  const { $t } = useIntl()
  const { editData } = props
  const form = Form.useFormInstance()


  const handleDpDCheckboxChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    if (isChecked) {
      let originalValue = form.getFieldValue(['advancedOption', 'dpdDelay'])
      if (originalValue === 0) {
        // Set default value when checkbox is checked
        // eslint-disable-next-line max-len
        form.setFieldValue(['advancedOption', 'dpdDelay'], get(defaultIpsecFormData, 'advancedOption.dpdDelay'))
      }
    }
  }

  useEffect(() => {
    const isDpdDelayEnabled = Boolean(editData?.advancedOption?.dpdDelay)

    form.setFieldValue('deadPeerDetectionDelayEnabledCheckbox', isDpdDelayEnabled)
  }, [editData])

  return <Row style={{ height: '60px' }}>
    <Col span={12}>
      <Form.Item
        name={'deadPeerDetectionDelayEnabledCheckbox'}
        valuePropName='checked'
      >
        <Checkbox onChange={handleDpDCheckboxChange}>
          <Space style={{ color: 'var(--acx-neutrals-60)' }} align='center'>
            {$t({ defaultMessage: 'Dead Peer Detection Delay' })}
            <Tooltip.Question
              title={$t(messageMapping.connection_dead_peer_detection_delay_tooltip)}
              placement='bottom'
              iconStyle={{ height: '16px', width: '16px' }}
            />
          </Space>
        </Checkbox>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        noStyle
        dependencies={['deadPeerDetectionDelayEnabledCheckbox']}
      >
        {({ getFieldValue }) => {
          const delayEnabled = getFieldValue(['deadPeerDetectionDelayEnabledCheckbox'])

          return delayEnabled && <Form.Item
            children={
              <Space align='center'>
                <Form.Item
                  noStyle
                  name={['advancedOption', 'dpdDelay']}
                  rules={[
                    { required: true, message: $t({ defaultMessage: 'Please enter delay value' }) },
                    {
                      type: 'integer',
                      transform: Number,
                      min: 1, max: 65536,
                      // eslint-disable-next-line max-len
                      message: $t({ defaultMessage: 'Delay value must be integer and between 1-65536' })
                    }
                  ]}
                  children={<InputNumber />} />
                <span> {$t({ defaultMessage: 'second(s)' })} </span>
              </Space>
            }
          />
        }}
      </Form.Item>
    </Col>
  </Row>
}