import { useEffect } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { useIntl }                   from 'react-intl'

import {
  useStepFormContext,
  useWatch
} from '@acx-ui/components'

import { NetworkHealthFormDto } from '../../types'

import { ipValidator } from './validator'

export function DnsServer () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const [isCustom, value] = [
    useWatch('isDnsServerCustom', form),
    useWatch('dnsServer', form)
  ]

  useEffect(() => {
    if (!isCustom && value) form.setFieldValue('dnsServer', undefined)
  }, [form, isCustom, value])

  return (
    <Form.Item required={isCustom} label={$t({ defaultMessage: 'DNS Server' })}>
      <Space>
        <Form.Item
          noStyle
          name='isDnsServerCustom'
        >
          <Radio.Group>
            <Radio value={false}>{$t({ defaultMessage: 'Default' })}</Radio>
            <Radio value={true}>{$t({ defaultMessage: 'Custom' })}</Radio>
          </Radio.Group>
        </Form.Item>
        {isCustom ? <Form.Item
          noStyle
          name='dnsServer'
          label={$t({ defaultMessage: 'DNS Server' })}
          rules={[
            { required: true },
            { validator: ipValidator }
          ]}
          children={<Input
            placeholder={$t({ defaultMessage: 'Enter an IP address' })}
          />}
        /> : null}
      </Space>
    </Form.Item>
  )
}
