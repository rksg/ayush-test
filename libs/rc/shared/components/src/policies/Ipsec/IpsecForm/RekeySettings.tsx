import { Form, InputNumber, Space } from 'antd'
import { RuleObject }               from 'antd/lib/form'
import { useIntl }                  from 'react-intl'

import { GridCol, GridRow, Select } from '@acx-ui/components'
import { IpSecRekeyTimeUnitEnum }   from '@acx-ui/rc/utils'

import { messageMapping } from './messageMapping'

interface FormFieldConfig {
  itemKey: string
  itemLabel?: string
  tooltipMsg?: string
  placeholder?: string
  rules?: RuleObject[]
  render: boolean
  defaultValue: number
}

export default function RekeySettings () {
  const { $t } = useIntl()
  const rekeyTimeUnitOptions = [
    { label: $t({ defaultMessage: 'Day(s)' }), value: IpSecRekeyTimeUnitEnum.DAY },
    { label: $t({ defaultMessage: 'Hour(s)' }), value: IpSecRekeyTimeUnitEnum.HOUR },
    { label: $t({ defaultMessage: 'Minute(s)' }), value: IpSecRekeyTimeUnitEnum.MINUTE }
  ]

  const formFieldConfig: FormFieldConfig[] = [
    {
      itemKey: 'ikeRekeyTime',
      itemLabel: $t({ defaultMessage: 'Internet Key Exchange (IKE)' }),
      render: true,
      defaultValue: 4,
      rules: [{ min: 1, max: 16384 }],
      tooltipMsg: $t(messageMapping.ike_rekey_tooltip)
    },
    {
      itemKey: 'espRekeyTime',
      itemLabel: $t({ defaultMessage: 'Encapsulating Security Payload (ESP)' }),
      render: true,
      defaultValue: 1,
      rules: [{ min: 1, max: 16384 }],
      tooltipMsg: $t(messageMapping.esp_rekey_tooltip)
    }
  ]

  return (
    <>
      {formFieldConfig.map((formField) => {
        const {
          itemKey,
          itemLabel,
          tooltipMsg,
          placeholder,
          defaultValue,
          rules,
          render
        } = formField
        if (!render) return null
        return (
          <GridRow>
            <GridCol col={{ span: 9 }}>
              <Form.Item
                key={itemKey}
                label={itemLabel}
                tooltip={tooltipMsg}
                rules={rules}
              />
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <Space>
                <Form.Item
                  name={itemKey}
                  initialValue={defaultValue}
                  children={
                    <InputNumber placeholder={placeholder} style={{ width: 80 }} />
                  } />
                <Form.Item name={itemKey+'Unit'}
                  initialValue={IpSecRekeyTimeUnitEnum.HOUR}
                  children={
                    <Select
                      style={{ width: 120 }}
                      options={rekeyTimeUnitOptions}
                      children={
                        rekeyTimeUnitOptions.map((item) =>
                          <Select.Option key={item.value} value={item.value}>
                            {item.label}
                          </Select.Option>)
                      } />
                  } />
              </Space>
            </GridCol>
          </GridRow>
        )
      })}
    </>
  )
}