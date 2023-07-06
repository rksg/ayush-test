import { Form, Input, Radio, Space } from 'antd'
import { NamePath }                  from 'antd/es/form/interface'
import { defineMessage, useIntl }    from 'react-intl'

import {
  StepsForm,
  useStepFormContext
} from '@acx-ui/components'
import { networkWifiIpRegExp } from '@acx-ui/rc/utils'

import { ServiceGuardFormDto } from '../../types'

const name = ['configs', 0, 'dnsServer'] as const
const label = defineMessage({ defaultMessage: 'DNS Server' })

const useIsCustom = () => {
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const isCustom = Form.useWatch('isDnsServerCustom', form)

  return { form, isCustom }
}

export function DnsServer () {
  const { $t } = useIntl()
  const { form, isCustom } = useIsCustom()
  const fieldName = name as unknown as NamePath

  return (
    <Form.Item required={isCustom} label={$t(label)}>
      <Space>
        <Form.Item
          noStyle
          name='isDnsServerCustom'
        >
          <Radio.Group
            onChange={(e) => !e.target.value && form.setFieldValue(fieldName, undefined)}
          >
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
  const { isCustom } = useIsCustom()

  return<>
    <Form.Item
      name={name as unknown as NamePath}
      label={$t(label)}
      children={<StepsForm.FieldSummary<string>
        convert={(value) => isCustom ? String(value) : $t({ defaultMessage: 'Default' })}
      />}
    />
    <Form.Item name='isDnsServerCustom' hidden />
  </>
}
