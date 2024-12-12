import { useEffect, useContext } from 'react'

import {
  Input,
  Form,
  Select,
  Switch,
  Space
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Tooltip }                    from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  DhcpOption82SubOption1Enum,
  DhcpOption82SubOption2Enum,
  DhcpOption82SubOption151Enum,
  DhcpOption82MacEnum,
  DhcpOption82Settings
} from '@acx-ui/rc/utils'

import { SoftgreProfileAndDHCP82Context } from '../SoftGRETunnelSettings'

import * as UI from './styledComponents'

const { useWatch } = Form
const { Option } = Select

interface DhcpOption82FormField {
  dhcpOption82SubOption1EnabledFieldName: (string|number)[]
  dhcpOption82SubOption1FormatFieldName: (string|number)[]
  dhcpOption82SubOption2EnabledFieldName: (string|number)[]
  dhcpOption82SubOption2FormatFieldName: (string|number)[]
  dhcpOption82SubOption150EnabledFieldName: (string|number)[]
  dhcpOption82SubOption151EnabledFieldName: (string|number)[]
  dhcpOption82SubOption151FormatFieldName: (string|number)[]
  dhcpOption82SubOption151InputFieldName: (string|number)[]
  dhcpOption82MacFormat: (string|number)[]
}

/* eslint-disable max-len */
const defaultDhcpOption82FormField = {
  dhcpOption82SubOption1EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption1Enabled'],
  dhcpOption82SubOption1FormatFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption1Format'],
  dhcpOption82SubOption2EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption2Enabled'],
  dhcpOption82SubOption2FormatFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption2Format'],
  dhcpOption82SubOption150EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption150Enabled'],
  dhcpOption82SubOption151EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption151Enabled'],
  dhcpOption82SubOption151FormatFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption151Format'],
  dhcpOption82SubOption151InputFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption151Input'],
  dhcpOption82MacFormat: ['wlan','advancedCustomization','dhcpOption82MacFormat']
} as DhcpOption82FormField


const selectDhcpOption82FormField = (context?: string, index?: number) : DhcpOption82FormField => {
  if (context && context === 'lanport') {
    return {
      dhcpOption82SubOption1EnabledFieldName: ['lan', index, 'dhcpOption82', 'subOption1Enabled'],
      dhcpOption82SubOption1FormatFieldName: ['lan', index, 'dhcpOption82', 'subOption1Format'],
      dhcpOption82SubOption2EnabledFieldName: ['lan', index, 'dhcpOption82', 'subOption2Enabled'],
      dhcpOption82SubOption2FormatFieldName: ['lan', index, 'dhcpOption82', 'subOption2Format'],
      dhcpOption82SubOption150EnabledFieldName: ['lan', index, 'dhcpOption82', 'subOption150Enabled'],
      dhcpOption82SubOption151EnabledFieldName: ['lan', index, 'dhcpOption82', 'subOption151Enabled'],
      dhcpOption82SubOption151FormatFieldName: ['lan', index, 'dhcpOption82', 'subOption151Format'],
      dhcpOption82SubOption151InputFieldName: ['lan', index, 'dhcpOption82', 'subOption151Input'],
      dhcpOption82MacFormat: ['lan', index, 'dhcpOption82','macFormat']
    } as DhcpOption82FormField
  }
  else {
    return defaultDhcpOption82FormField
  }
}
/* eslint-enable max-len */

export const DhcpOption82SettingsFormField = (props: {
  labelWidth?: string
  context?: string
  index?: number
  onGUIChanged?: (fieldName: string) => void
  isUnderAPNetworking?: boolean
  existedDHCP82OptionSettings?: DhcpOption82Settings
  readonly: boolean
 }) => {

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const {
    labelWidth = '250px',
    context,
    index = 0,
    onGUIChanged,
    isUnderAPNetworking,
    existedDHCP82OptionSettings,
    readonly
  } = props

  const { venueApModelLanPortSettingsV1 } = useContext(SoftgreProfileAndDHCP82Context)

  const {
    dhcpOption82SubOption1EnabledFieldName,
    dhcpOption82SubOption1FormatFieldName,
    dhcpOption82SubOption2EnabledFieldName,
    dhcpOption82SubOption2FormatFieldName,
    dhcpOption82SubOption150EnabledFieldName,
    dhcpOption82SubOption151EnabledFieldName,
    dhcpOption82SubOption151FormatFieldName,
    dhcpOption82SubOption151InputFieldName,
    dhcpOption82MacFormat
  } = selectDhcpOption82FormField(context, index)

  useEffect(() => {
    const existedDHCP82OptionSettingsInVenue =
      venueApModelLanPortSettingsV1?.softGreSettings?.dhcpOption82Settings
    if (context) {
      let settings = {} as DhcpOption82Settings
      if(!isUnderAPNetworking && existedDHCP82OptionSettingsInVenue) {
        settings = existedDHCP82OptionSettingsInVenue
      }
      if (isUnderAPNetworking && existedDHCP82OptionSettings) {
        settings = existedDHCP82OptionSettings
      }

      if(!_.isEmpty(settings)) {
        /* eslint-disable max-len */
        form?.setFieldValue(dhcpOption82SubOption1EnabledFieldName, settings.subOption1Enabled)
        form?.setFieldValue(dhcpOption82SubOption1FormatFieldName, settings.subOption1Format)
        form?.setFieldValue(dhcpOption82SubOption2EnabledFieldName, settings.subOption2Enabled)
        form?.setFieldValue(dhcpOption82SubOption2FormatFieldName, settings.subOption2Format)
        form?.setFieldValue(dhcpOption82SubOption150EnabledFieldName, settings.subOption150Enabled)
        form?.setFieldValue(dhcpOption82SubOption151EnabledFieldName, settings.subOption151Enabled)
        form?.setFieldValue(dhcpOption82SubOption151FormatFieldName, settings.subOption151Format)
        form?.setFieldValue(dhcpOption82SubOption151InputFieldName, settings.subOption151Input)
        form?.setFieldValue(dhcpOption82MacFormat, settings.macFormat)
        /* eslint-enable max-len */
      }

    }
  }, [venueApModelLanPortSettingsV1, existedDHCP82OptionSettings])

  const onFormFieldChange = () => {
    onGUIChanged && onGUIChanged('DHCPOption82Settings')
  }

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

  const apAndClientMacFormatDelimiter =
      $t({ defaultMessage: 'AP MAC address will always be in uppercase, ' +
        'while client MAC address will always be in lowercase.' })

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
          {$t({ defaultMessage: 'Agent Circuit ID (#1)' })}
        </Space>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 480px' }}>
          <Form.Item
            name={dhcpOption82SubOption1EnabledFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={true}
            children={<Switch disabled={readonly} onChange={onFormFieldChange}/>}
          />
          { dhcpOption82SubOption1Enabled &&
            <Form.Item
              name={dhcpOption82SubOption1FormatFieldName}
              initialValue={DhcpOption82SubOption1Enum.SUBOPT1_AP_INFO_LOCATION}
              children={
                <Select
                  disabled={readonly}
                  options={dhcp82SubOption1Options}
                  onChange={onFormFieldChange} />
              }
            />
          }
        </div>
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'Agent Remote ID (#2)' })}
        </Space>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 480px auto' }}>
          <Form.Item
            name={dhcpOption82SubOption2EnabledFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch disabled={readonly} onChange={onFormFieldChange}/>}
          />
          { dhcpOption82SubOption2Enabled &&
            <Form.Item
              name={dhcpOption82SubOption2FormatFieldName}
              initialValue={DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC}
              children={
                <Select
                  disabled={readonly}
                  options={dhcp82SubOption2Options}
                  onChange={onFormFieldChange}/>
              }
            />
          }
        </div>
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'DHCPv4 Virtual Subnet Selection (#150)' })}
        </Space>
        <Form.Item
          name={dhcpOption82SubOption150EnabledFieldName}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch disabled={readonly} onChange={onFormFieldChange}/>}
        />
      </UI.FieldLabel>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'DHCPv4 Virtual Subnet Selection Control (#151)' })}
        </Space>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 150px auto' }}>

          <Form.Item
            name={dhcpOption82SubOption151EnabledFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch disabled={readonly} onChange={onFormFieldChange}/>}
          />
          { dhcpOption82SubOption151Enabled &&
            <Form.Item
              name={dhcpOption82SubOption151FormatFieldName}
              initialValue={DhcpOption82SubOption151Enum.SUBOPT151_AREA_NAME}
              children={
                <Select disabled={readonly} onChange={onFormFieldChange}>
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
              name={dhcpOption82SubOption151InputFieldName}
              style={{ marginLeft: '10px' }}
              rules={[
                { required: true, message: $t({ defaultMessage: 'Please enter Area Name' }) }
              ]}
              children={
                <Input style={{ width: '320px' }}
                  disabled={readonly}
                  onChange={onFormFieldChange}
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
          <Space>
            {$t({ defaultMessage: 'AP & Client MAC Format Delimiter' })}
            <Tooltip
              title={apAndClientMacFormatDelimiter}
              placement='right'
            >
              <QuestionMarkCircleOutlined
                style={{ height: '14px', marginBottom: -3 }}
              />
            </Tooltip>
          </Space>
          <Form.Item
            name={dhcpOption82MacFormat}
            initialValue={DhcpOption82MacEnum.COLON}
            children={
              <Select disabled={readonly} onChange={onFormFieldChange}>
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
        </UI.FieldLabel>
      }
    </>

  )

}
