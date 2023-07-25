/* eslint-disable max-len */
import { ReactNode, CSSProperties } from 'react'

import {
  Input,
  Form,
  Select,
  Switch,
  FormItemProps,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { Fieldset, Tooltip } from '@acx-ui/components'

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

  const dhcp82SubOption1Options = [{
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_INFO_LOCATION,
    label: $t({ defaultMessage: 'IF Name: VLAN ID: ESSID: AP Model: AP Name: AP MAC: Location' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_INFO,
    label: $t({ defaultMessage: 'IF Name: VLAN ID: ESSID: AP Model: AP Name: AP MAC' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_ESSID_PRIVACYTYPE,
    label: $t({ defaultMessage: 'AP MAC; ESSID; Privacy Type' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_HEX,
    label: $t({ defaultMessage: 'AP MAC-hex' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_HEX_ESSID,
    label: $t({ defaultMessage: 'AP MAC-hex: ESSID' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_ESSID,
    label: $t({ defaultMessage: 'ESSID' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC,
    label: $t({ defaultMessage: 'AP MAC' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_MAC_ESSID,
    label: $t({ defaultMessage: 'AP MAC: ESSID' })
  }, {
    value: DhcpOption82SubOption1Enum.SUBOPT1_AP_NAME_ESSID,
    label: $t({ defaultMessage: 'AP Name: ESSID' })
  }]

  const dhcp82SubOption2Options = [{
    value: DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC,
    label: $t({ defaultMessage: 'Client MAC' })
  }, {
    value: DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC_HEX,
    label: $t({ defaultMessage: 'Client MAC-hex' })
  }, {
    value: DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC_HEX_ESSID,
    label: $t({ defaultMessage: 'Client MAC-hex: ESSID' })
  }, {
    value: DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC,
    label: $t({ defaultMessage: 'AP MAC' })
  }, {
    value: DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC_HEX,
    label: $t({ defaultMessage: 'AP MAC-hex' })
  }, {
    value: DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC_HEX_ESSID,
    label: $t({ defaultMessage: 'AP MAC-hex: ESSID' })
  }, {
    value: DhcpOption82SubOption2Enum.SUBOPT2_AP_MAC_ESSID,
    label: $t({ defaultMessage: 'AP MAC: ESSID' })
  }, {
    value: DhcpOption82SubOption2Enum.SUBOPT2_AP_NAME,
    label: $t({ defaultMessage: 'AP Name' })
  }]

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

  const dhcpOption82SubOption1TooltipContent = $t({ defaultMessage: 'Agent Circuit ID' })
  const dhcpOption82SubOption2TooltipContent = $t({ defaultMessage: 'Agent Remote ID' })
  const dhcpOption82SubOption150TooltipContent =
      $t({ defaultMessage: 'DHCPv4 Virtual Subnet Selection' })
  const dhcpOption82SubOption151TooltipContent =
      $t({ defaultMessage: 'DHCPv4 Virtual Subnet Selection Control' })

  return (
    <FieldsetItem
      name={['wlan', 'advancedCustomization', 'dhcpOption82Enabled']}
      label={$t({ defaultMessage: 'DHCP Option 82' })}
      initialValue={false}
      switchStyle={{ marginLeft: '155px' }}
      style={{ width: 'max-content', marginLeft: '-8px' }}
      onChange={onChangeDhcpOption82}>

      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'Sub-option 1' })}
          <Tooltip.Question
            title={dhcpOption82SubOption1TooltipContent}
            placement='right'
          />
        </Space>
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
                <Select options={dhcp82SubOption1Options} />
              }
            />
          }
        </div>
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'Sub-option 2' })}
          <Tooltip.Question
            title={dhcpOption82SubOption2TooltipContent}
            placement='right'
          />
        </Space>
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
                <Select options={dhcp82SubOption2Options} />
              }
            />
          }
        </div>
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'Sub-option 150 with VLAN ID' })}
          <Tooltip.Question
            title={dhcpOption82SubOption150TooltipContent}
            placement='right'
          />
        </Space>
        <Form.Item
          name={dhcpOption82SubOption150EnabledFieldName}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'Sub-option 151' })}
          <Tooltip.Question
            title={dhcpOption82SubOption151TooltipContent}
            placement='right'
          />
        </Space>
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
