import { useEffect } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { defineMessage, useIntl }    from 'react-intl'

import {
  StepsFormNew,
  useStepFormContext
} from '@acx-ui/components'

import { NetworkHealthFormDto } from '../../types'

import { ipValidator } from './validator'

const name = 'dnsServer' as const
const label = defineMessage({ defaultMessage: 'DNS Server' })

const useField = () => {
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const [isCustom, value] = [
    Form.useWatch('isDnsServerCustom', form),
    Form.useWatch(name, form)
  ]

  return { form, isCustom, value }
}

export function DnsServer () {
  const { $t } = useIntl()
  const { form, isCustom, value } = useField()

  useEffect(() => {
    if (!isCustom && value) form.setFieldValue(name, undefined)
  }, [form, isCustom, value])

  return (
    <Form.Item required={isCustom} label={$t(label)}>
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
          name={name}
          label={$t(label)}
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

DnsServer.fieldName = name
DnsServer.label = label

DnsServer.FieldSummary = function DnsServerFieldSummary () {
  const { $t } = useIntl()
  const { isCustom } = useField()

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary<string>
      convert={(value) => isCustom ? String(value) : $t({ defaultMessage: 'Default' })}
    />}
  />
}
