
import { ReactNode, CSSProperties } from 'react'

import {
  Input,
  Form,
  Select,
  Switch,
  FormItemProps
} from 'antd'
import { useIntl } from 'react-intl'

import { Fieldset } from '@acx-ui/components'


import * as UI from './styledComponents'

const { useWatch } = Form
const { Option } = Select

enum DhcpOption82SubOption1Enum {
  SUBOPT1_AP_INFO_LOCATION = 'SUBOPT1_AP_INFO_LOCATION',
  SUBOPT1_AP_INFO = 'SUBOPT1_AP_INFO',
  SUBOPT1_AP_MAC_ESSID_PRIVACYTYPE = 'SUBOPT1_AP_MAC_ESSID_PRIVACYTYPE',
  SUBOPT1_AP_MAC_HEX = 'SUBOPT1_AP_MAC_hex',
  SUBOPT1_AP_MAC_HEX_ESSID = 'SUBOPT1_AP_MAC_hex_ESSID',
  SUBOPT1_ESSID = 'SUBOPT1_ESSID',
  SUBOPT1_AP_MAC = 'SUBOPT1_AP_MAC',
  SUBOPT1_AP_MAC_ESSID = 'SUBOPT1_AP_MAC_ESSID',
  SUBOPT1_AP_NAME_ESSID = 'SUBOPT1_AP_Name_ESSID',
}

enum DhcpOption82SubOption2Enum {
  SUBOPT2_CLIENT_MAC = 'SUBOPT2_CLIENT_MAC',
  SUBOPT2_CLIENT_MAC_HEX = 'SUBOPT2_CLIENT_MAC_hex',
  SUBOPT2_CLIENT_MAC_HEX_ESSID = 'SUBOPT2_CLIENT_MAC_hex_ESSID',
  SUBOPT2_AP_MAC = 'SUBOPT2_AP_MAC',
  SUBOPT2_AP_MAC_HEX = 'SUBOPT2_AP_MAC_hex',
  SUBOPT2_AP_MAC_HEX_ESSID = 'SUBOPT2_AP_MAC_hex_ESSID',
  SUBOPT2_AP_MAC_ESSID = 'SUBOPT2_AP_MAC_ESSID',
  SUBOPT2_AP_NAME = 'SUBOPT2_AP_Name',
}

enum DhcpOption82SubOption151Enum {
  SUBOPT151_AREA_NAME = 'SUBOPT151_AREA_NAME',
  SUBOPT151_ESSID = 'SUBOPT151_ESSID',
}

enum DhcpOption82MacEnum {
  COLON = 'COLON',
  HYPHEN = 'HYPHEN',
  NODELIMITER = 'NODELIMITER',
}

export function DhcpOption82Form (props: { labelWidth?: string }) {
  const { $t } = useIntl()
  const { labelWidth='250px' } = props

  const dhcpOption82SubOption1EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption1Enabled']
  const dhcpOption82SubOption2EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption2Enabled']
  const dhcpOption82SubOption150EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption150Enabled']
  const dhcpOption82SubOption151EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption151Enabled']

  const form = Form.useFormInstance()
  const [
    dhcpOption82SubOption1Enabled,
    dhcpOption82SubOption2Enabled,
    dhcpOption82SubOption151Enabled,
    dhcpOption82SubOption2Format,
    dhcpOption82SubOption151Format
  ] = [
    useWatch<boolean>(dhcpOption82SubOption1EnabledFieldName),
    useWatch<boolean>(dhcpOption82SubOption2EnabledFieldName),
    useWatch<boolean>(dhcpOption82SubOption151EnabledFieldName),
    useWatch<DhcpOption82SubOption2Enum>
    (['wlan','advancedCustomization', 'dhcpOption82SubOption2Format']),
    useWatch<DhcpOption82SubOption151Enum>
    (['wlan','advancedCustomization', 'dhcpOption82SubOption151Format'])
  ]

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
      switchStyle={{ marginLeft: '155px' }}
      style={{ width: 'max-content', marginLeft: '-8px' }}
      onChange={onChangeDhcpOption82}>

      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Sub-option 1' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 480px' }}>
          <Form.Item
            name={dhcpOption82SubOption1EnabledFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={true}
            children={<Switch />}
          />
          { dhcpOption82SubOption1Enabled &&
            <Form.Item
              name={['wlan','advancedCustomization','dhcpOption82SubOption1Format']}
              initialValue={DhcpOption82SubOption1Enum.SUBOPT1_AP_INFO_LOCATION}
              children={
                <Select>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_INFO_LOCATION}>
                    {$t({ defaultMessage:
                      'IF Name: VLAN ID: ESSID: AP Model: AP Name: AP MAC: Location' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_INFO}>
                    {$t({ defaultMessage: 'IF Name: VLAN ID: ESSID: AP Model: AP Name: AP MAC' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_ESSID_PRIVACYTYPE}>
                    {$t({ defaultMessage: 'AP MAC; ESSID; Privacy Type' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_HEX}>
                    {$t({ defaultMessage: 'AP MAC-hex' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_HEX_ESSID}>
                    {$t({ defaultMessage: 'AP MAC-hex: ESSID' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_ESSID}>
                    {$t({ defaultMessage: 'ESSID' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC}>
                    {$t({ defaultMessage: 'AP MAC' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_ESSID}>
                    {$t({ defaultMessage: 'AP MAC: ESSID' })}
                  </Option>
                  <Option value={DhcpOption82SubOption1Enum.SUBOPT1_AP_NAME_ESSID}>
                    {$t({ defaultMessage: 'AP Name: ESSID' })}
                  </Option>
                </Select>
              }
            />
          }
        </div>
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Sub-option 2' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 480px auto' }}>
          <Form.Item
            name={dhcpOption82SubOption2EnabledFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          { dhcpOption82SubOption2Enabled &&
            <Form.Item
              name={['wlan','advancedCustomization','dhcpOption82SubOption2Format']}
              initialValue={DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC}
              children={
                <Select>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC}>
                    {$t({ defaultMessage: 'Client MAC' })}
                  </Option>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC_HEX}>
                    {$t({ defaultMessage: 'Client MAC-hex' })}
                  </Option>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC_HEX_ESSID}>
                    {$t({ defaultMessage: 'Client MAC-hex: ESSID' })}
                  </Option>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC}>
                    {$t({ defaultMessage: 'AP MAC' })}
                  </Option>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC_HEX}>
                    {$t({ defaultMessage: 'AP MAC-hex' })}
                  </Option>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC_HEX_ESSID}>
                    {$t({ defaultMessage: 'AP MAC-hex: ESSID' })}
                  </Option>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC_ESSID}>
                    {$t({ defaultMessage: 'AP MAC: ESSID' })}
                  </Option>
                  <Option value={DhcpOption82SubOption2Enum.SUBOPT2_AP_NAME}>
                    {$t({ defaultMessage: 'AP Name' })}
                  </Option>
                </Select>
              }
            />
          }
        </div>
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Sub-option 150 with VLAN ID' })}
        <div>
          <Form.Item
            name={dhcpOption82SubOption150EnabledFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </div>
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        {$t({ defaultMessage: 'Sub-option 151' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 150px auto' }}>
          <Form.Item
            name={dhcpOption82SubOption151EnabledFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          { dhcpOption82SubOption151Enabled &&
            <Form.Item
              name={['wlan','advancedCustomization','dhcpOption82SubOption151Format']}
              initialValue={DhcpOption82SubOption151Enum.SUBOPT151_AREA_NAME}
              children={
                <Select>
                  <Option value={DhcpOption82SubOption151Enum.SUBOPT151_AREA_NAME}>
                    {$t({ defaultMessage: 'Area Name' })}
                  </Option>
                  <Option value={DhcpOption82SubOption151Enum.SUBOPT151_ESSID}>
                    {$t({ defaultMessage: 'ESSID' })}
                  </Option>
                </Select>
              }
            />
          }
          { DhcpOption82SubOption151Enum.SUBOPT151_AREA_NAME === dhcpOption82SubOption151Format &&
            <Form.Item
              name={['wlan','advancedCustomization','dhcpOption82SubOption151Input']}
              style={{ marginLeft: '10px' }}
              rules={[
                { required: true, message: $t({ defaultMessage: 'Please enter Area Name' }) }
              ]}
              children={
                <Input style={{ width: '320px' }}
                />
              }
            />
          }
        </div>
      </UI.FieldLabel>
      { (dhcpOption82SubOption1Enabled ||
        (dhcpOption82SubOption2Enabled &&
          DhcpOption82SubOption2Enum.SUBOPT2_AP_NAME !== dhcpOption82SubOption2Format) ||
        (dhcpOption82SubOption151Enabled &&
          DhcpOption82SubOption151Enum.SUBOPT151_ESSID === dhcpOption82SubOption151Format)) &&
        <UI.FieldLabel width={labelWidth}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px' }}>
            <Form.Item
              name={['wlan','advancedCustomization','dhcpOption82MacFormat']}
              label='AP & Client MAC format delimiter'
              initialValue={DhcpOption82MacEnum.COLON}
              children={
                <Select>
                  <Option value={DhcpOption82MacEnum.COLON}>
                    {$t({ defaultMessage: 'AA:BB:CC:DD:EE:FF' })}
                  </Option>
                  <Option value={DhcpOption82MacEnum.HYPHEN}>
                    {$t({ defaultMessage: 'AA-BB-CC-DD-EE-FF' })}
                  </Option>
                  <Option value={DhcpOption82MacEnum.NODELIMITER}>
                    {$t({ defaultMessage: 'AABBCCDDEEFF' })}
                  </Option>
                </Select>
              }
            />
          </div>
        </UI.FieldLabel>
      }
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
