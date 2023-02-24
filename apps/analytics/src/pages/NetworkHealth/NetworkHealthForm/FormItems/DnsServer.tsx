import { useEffect } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { NamePath }                  from 'antd/es/form/interface'
import { defineMessage, useIntl }    from 'react-intl'

import {
  StepsFormNew,
  useStepFormContext
} from '@acx-ui/components'
import { networkWifiIpRegExp } from '@acx-ui/rc/utils'

import { NetworkHealthFormDto } from '../../types'

const name = ['configs', 0, 'dnsServer'] as const
const label = defineMessage({ defaultMessage: 'DNS Server' })

const useField = () => {
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const [isCustom, value] = [
    Form.useWatch('isDnsServerCustom', form),
    Form.useWatch(name as unknown as NamePath, form)
  ]

  return { form, isCustom, value }
}

export function DnsServer () {
  const { $t } = useIntl()
  const { form, isCustom, value } = useField()
  const fieldName = name as unknown as NamePath

  useEffect(() => {
    if (!isCustom && value) form.setFieldValue(fieldName, undefined)
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
          name={fieldName}
          label={$t(label)}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) }
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
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary<string>
      convert={(value) => isCustom ? String(value) : $t({ defaultMessage: 'Default' })}
    />}
  />
}
