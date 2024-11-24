import { CSSProperties } from 'react'


import {
  Input,
  Form,
  Select,
  Switch,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { Tooltip }      from '@acx-ui/components'
import {
  DhcpOption82SubOption1Enum,
  DhcpOption82SubOption2Enum,
  DhcpOption82SubOption151Enum,
  DhcpOption82MacEnum
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const { useWatch } = Form
const { Option } = Select


export const DhcpOption82SettingsFormField = () => {

  const { $t } = useIntl()

  const labelWidth = '250px'

  const iconStyle: CSSProperties = { height: '16px', width: '16px', marginBottom: '-3px' }

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

  const dhcpOption82SubOption1TooltipContent = $t({ defaultMessage: 'Agent Circuit ID' })
  const dhcpOption82SubOption2TooltipContent = $t({ defaultMessage: 'Agent Remote ID' })
  const dhcpOption82SubOption150TooltipContent =
      $t({ defaultMessage: 'DHCPv4 Virtual Subnet Selection' })
  const dhcpOption82SubOption151TooltipContent =
      $t({ defaultMessage: 'DHCPv4 Virtual Subnet Selection Control' })

  const apAndClientMacFormatDelimiter =
      $t({ defaultMessage: 'AP MAC address will always be in uppercase, ' +
        'while client MAC address will always be in lowercase.' })

  const dhcpOption82SubOption1EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption1Enabled']
  const dhcpOption82SubOption1FormatFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption1Format']
  const dhcpOption82SubOption2EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption2Enabled']
  const dhcpOption82SubOption2FormatFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption2Format']
  const dhcpOption82SubOption150EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption150Enabled']
  const dhcpOption82SubOption151EnabledFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption151Enabled']
  const dhcpOption82SubOption151FormatFieldName =
    ['wlan','advancedCustomization','dhcpOption82SubOption151Format']

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
    useWatch<DhcpOption82SubOption2Enum>(dhcpOption82SubOption2FormatFieldName),
    useWatch<DhcpOption82SubOption151Enum>(dhcpOption82SubOption151FormatFieldName)
  ]

  return (
    <>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'Sub-option 1' })}
          <Tooltip.Question
            title={dhcpOption82SubOption1TooltipContent}
            placement='bottom'
            iconStyle={iconStyle}
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
              name={dhcpOption82SubOption1FormatFieldName}
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
            placement='bottom'
            iconStyle={iconStyle}
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
              name={dhcpOption82SubOption2FormatFieldName}
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
            placement='bottom'
            iconStyle={iconStyle}
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
            placement='bottom'
            iconStyle={iconStyle}
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
              name={dhcpOption82SubOption151FormatFieldName}
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
              label={$t({ defaultMessage: 'AP & Client MAC format delimiter' })}
              tooltip={apAndClientMacFormatDelimiter}
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
    </>

  )

}