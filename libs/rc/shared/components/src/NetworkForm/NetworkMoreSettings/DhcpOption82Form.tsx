/* eslint-disable max-len */
import { ReactNode, CSSProperties } from 'react'

import {
  Form,
  FormItemProps
} from 'antd'
import { useIntl } from 'react-intl'

import { Fieldset } from '@acx-ui/components'

import { DhcpOption82SettingsFormField } from '../../DhcpOption82Settings'

const { useWatch } = Form

export function DhcpOption82Form (props: { labelWidth?: string }) {
  const { $t } = useIntl()
  const { labelWidth = '250px' } = props

  const dhcpOption82EnabledFieldName =
    ['wlan', 'advancedCustomization', 'dhcpOption82Enabled']
  const dhcpOption82SubOption1EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption1Enabled']
  const dhcpOption82SubOption2EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption2Enabled']
  const dhcpOption82SubOption150EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption150Enabled']
  const dhcpOption82SubOption151EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption151Enabled']

  const form = Form.useFormInstance()
  const dhcpOption82Enabled = useWatch<boolean>(dhcpOption82EnabledFieldName)

  const onChangeDhcpOption82 = (checked: boolean) => {
    if (checked
        && !form.getFieldValue(dhcpOption82SubOption1EnabledFieldName)
        && !form.getFieldValue(dhcpOption82SubOption2EnabledFieldName)
        && !form.getFieldValue(dhcpOption82SubOption150EnabledFieldName)
        && !form.getFieldValue(dhcpOption82SubOption151EnabledFieldName)) {
      form.setFieldValue(dhcpOption82SubOption1EnabledFieldName, true)
    }
  }

  return (
    <FieldsetItem
      name={['wlan', 'advancedCustomization', 'dhcpOption82Enabled']}
      label={$t({ defaultMessage: 'DHCP Option 82' })}
      initialValue={false}
      switchStyle={{ marginLeft: dhcpOption82Enabled? '140px' : '155px' }}
      style={{ width: 'max-content', marginLeft: '-8px' }}
      onChange={onChangeDhcpOption82}>
      <DhcpOption82SettingsFormField
        labelWidth={labelWidth}
        readonly={false}
      />
    </FieldsetItem>
  )
}
const FieldsetItem = ({
  children,
  label,
  switchStyle,
  onChange,
  ...props
}: FormItemProps &
  { label: string,
    children: ReactNode,
    switchStyle: CSSProperties,
    onChange: (checked: boolean) => void
  }) => <Form.Item
  {...props}
  valuePropName='checked'
>
  <Fieldset
    {...{ label, children }}
    switchStyle={switchStyle}
    onChange={onChange}/>
</Form.Item>
