import { useEffect } from 'react'

import {
  Input,
  Form,
  Select,
  Switch,
  Space
} from 'antd'
import { NamePath } from 'antd/lib/form/interface'
import { useIntl }  from 'react-intl'

import { DraggableTagField, Tooltip, cssStr } from '@acx-ui/components'
import type { DraggableTag }                  from '@acx-ui/components'
import { useIsSplitOn, Features }             from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }         from '@acx-ui/icons'
import {
  DhcpOption82SubOption1Enum,
  DhcpOption82SubOption2Enum,
  DhcpOption82SubOption151Enum,
  DhcpOption82MacEnum,
  DhcpOption82SubOption1CustomizationAttribute,
  DhcpOption82SubOption1CustomizationType,
  NewDhcpOption82SubOption1Enum,
  NewDhcpOption82SubOption2Enum,
  NewDhcpOption82SubOption151Enum,
  DhcpOption82MacDelimiterEnum,
  DhcpOption82SubOption1Customization
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const { useWatch } = Form
const { Option } = Select

// Mapping for DhcpOption82SubOption1CustomizationType enum values to labels
const dhcpOption82SubOption1CustomizationTypeLabels = {
  [DhcpOption82SubOption1CustomizationType.INTERFACE]: 'IF-Name',
  [DhcpOption82SubOption1CustomizationType.INTERFACE_NO_PREFIX]: 'IF-Name (No prefix)',
  [DhcpOption82SubOption1CustomizationType.VLAN]: 'VLAN ID',
  [DhcpOption82SubOption1CustomizationType.ESSID]: 'ESSID',
  [DhcpOption82SubOption1CustomizationType.AP_MODEL]: 'AP Model',
  [DhcpOption82SubOption1CustomizationType.AP_NAME]: 'AP Name',
  [DhcpOption82SubOption1CustomizationType.AP_MAC]: 'AP MAC',
  [DhcpOption82SubOption1CustomizationType.USER_DEFINED]: 'User Defined'
}

interface DhcpOption82FormField {
  dhcpOption82SubOption1EnabledFieldName: NamePath
  dhcpOption82SubOption1FormatFieldName: NamePath
  dhcpOption82SubOption1CustomizationFieldName: NamePath
  dhcpOption82SubOption2EnabledFieldName: NamePath
  dhcpOption82SubOption2FormatFieldName: NamePath
  dhcpOption82SubOption150EnabledFieldName: NamePath
  dhcpOption82SubOption151EnabledFieldName: NamePath
  dhcpOption82SubOption151FormatFieldName: NamePath
  dhcpOption82SubOption151InputFieldName: NamePath
  dhcpOption82MacFormat: NamePath
}

/* eslint-disable max-len */
const defaultDhcpOption82FormField = {
  dhcpOption82SubOption1EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption1Enabled'],
  dhcpOption82SubOption1FormatFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption1Format'],
  dhcpOption82SubOption1CustomizationFieldName: [],
  dhcpOption82SubOption2EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption2Enabled'],
  dhcpOption82SubOption2FormatFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption2Format'],
  dhcpOption82SubOption150EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption150Enabled'],
  dhcpOption82SubOption151EnabledFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption151Enabled'],
  dhcpOption82SubOption151FormatFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption151Format'],
  dhcpOption82SubOption151InputFieldName: ['wlan','advancedCustomization','dhcpOption82SubOption151Input'],
  dhcpOption82MacFormat: ['wlan','advancedCustomization','dhcpOption82MacFormat']
} as DhcpOption82FormField


const selectDhcpOption82FormField = (isLanPortSettings?: boolean) : DhcpOption82FormField => {
  if (isLanPortSettings) {
    return {
      dhcpOption82SubOption1EnabledFieldName: 'subOption1Enabled',
      dhcpOption82SubOption1FormatFieldName: 'subOption1Format',
      dhcpOption82SubOption1CustomizationFieldName: 'subOption1Customization',
      dhcpOption82SubOption2EnabledFieldName: 'subOption2Enabled',
      dhcpOption82SubOption2FormatFieldName: 'subOption2Format',
      dhcpOption82SubOption150EnabledFieldName: 'subOption150Enabled',
      dhcpOption82SubOption151EnabledFieldName: 'subOption151Enabled',
      dhcpOption82SubOption151FormatFieldName: 'subOption151Format',
      // In LAN port the subOption151Text is used for input field
      dhcpOption82SubOption151InputFieldName: 'subOption151Text',
      dhcpOption82MacFormat: 'macDelimiter'
    } as DhcpOption82FormField
  }
  else {
    return defaultDhcpOption82FormField
  }
}
/* eslint-enable max-len */

export const DhcpOption82SettingsFormField = (props: {
  labelWidth?: string
  isLanPortSettings?: boolean
  readOnly?: boolean
 }) => {

  const form = Form.useFormInstance()

  const { $t } = useIntl()
  const {
    labelWidth = '250px',
    isLanPortSettings = false,
    readOnly = false
  } = props

  const isDhcpOption82Enabled = useIsSplitOn(Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)

  const {
    dhcpOption82SubOption1EnabledFieldName,
    dhcpOption82SubOption1FormatFieldName,
    dhcpOption82SubOption1CustomizationFieldName,
    dhcpOption82SubOption2EnabledFieldName,
    dhcpOption82SubOption2FormatFieldName,
    dhcpOption82SubOption150EnabledFieldName,
    dhcpOption82SubOption151EnabledFieldName,
    dhcpOption82SubOption151FormatFieldName,
    dhcpOption82SubOption151InputFieldName,
    dhcpOption82MacFormat
  } = selectDhcpOption82FormField(isLanPortSettings)

  const customizationFieldName = '_customization_tags'

  // eslint-disable-next-line max-len
  const Option82SubOption1Enum = isLanPortSettings ? NewDhcpOption82SubOption1Enum : DhcpOption82SubOption1Enum
  // eslint-disable-next-line max-len
  const Option82SubOption2Enum = isLanPortSettings ? NewDhcpOption82SubOption2Enum : DhcpOption82SubOption2Enum
  // eslint-disable-next-line max-len
  const Option82SubOption151Enum = isLanPortSettings ? NewDhcpOption82SubOption151Enum : DhcpOption82SubOption151Enum

  const dhcp82SubOption1Options = [
    ...(!isLanPortSettings ? [
      {
        value: Option82SubOption1Enum.SUBOPT1_AP_INFO_LOCATION,
        // eslint-disable-next-line max-len
        label: $t({ defaultMessage: 'IF Name: VLAN ID: ESSID: AP Model: AP Name: AP MAC: Location' })
      }] : []),
    {
      value: Option82SubOption1Enum.SUBOPT1_AP_INFO,
      label: $t({ defaultMessage: 'IF Name: VLAN ID: ESSID: AP Model: AP Name: AP MAC' })
    }, {
      value: Option82SubOption1Enum.SUBOPT1_AP_MAC_ESSID_PRIVACYTYPE,
      label: $t({ defaultMessage: 'AP MAC; ESSID; Privacy Type' })
    }, {
      value: Option82SubOption1Enum.SUBOPT1_AP_MAC_HEX,
      label: $t({ defaultMessage: 'AP MAC-hex' })
    }, {
      value: Option82SubOption1Enum.SUBOPT1_AP_MAC_HEX_ESSID,
      label: $t({ defaultMessage: 'AP MAC-hex: ESSID' })
    }, {
      value: Option82SubOption1Enum.SUBOPT1_ESSID,
      label: $t({ defaultMessage: 'ESSID' })
    }, {
      value: Option82SubOption1Enum.SUBOPT1_AP_MAC,
      label: $t({ defaultMessage: 'AP MAC' })
    }, {
      value: Option82SubOption1Enum.SUBOPT1_AP_MAC_ESSID,
      label: $t({ defaultMessage: 'AP MAC: ESSID' })
    }, {
      value: Option82SubOption1Enum.SUBOPT1_AP_NAME_ESSID,
      label: $t({ defaultMessage: 'AP Name: ESSID' })
    },
    ...(isLanPortSettings ? [{
      value: Option82SubOption1Enum.SUBOPT1_CUSTOMIZED,
      label: $t({ defaultMessage: 'Custom' })
    }] : [])
  ]

  const dhcp82SubOption2Options = [{
    value: Option82SubOption2Enum.SUBOPT2_CLIENT_MAC,
    label: $t({ defaultMessage: 'Client MAC' })
  }, {
    value: Option82SubOption2Enum.SUBOPT2_CLIENT_MAC_HEX,
    label: $t({ defaultMessage: 'Client MAC-hex' })
  }, {
    value: Option82SubOption2Enum.SUBOPT2_CLIENT_MAC_HEX_ESSID,
    label: $t({ defaultMessage: 'Client MAC-hex: ESSID' })
  }, {
    value: Option82SubOption2Enum.SUBOPT2_AP_MAC,
    label: $t({ defaultMessage: 'AP MAC' })
  }, {
    value: Option82SubOption2Enum.SUBOPT2_AP_MAC_HEX,
    label: $t({ defaultMessage: 'AP MAC-hex' })
  }, {
    value: Option82SubOption2Enum.SUBOPT2_AP_MAC_HEX_ESSID,
    label: $t({ defaultMessage: 'AP MAC-hex: ESSID' })
  }, {
    value: Option82SubOption2Enum.SUBOPT2_AP_MAC_ESSID,
    label: $t({ defaultMessage: 'AP MAC: ESSID' })
  }, {
    value: Option82SubOption2Enum.SUBOPT2_AP_NAME,
    label: $t({ defaultMessage: 'AP Name' })
  }]

  const apAndClientMacFormatDelimiter =
      $t({ defaultMessage: 'AP MAC address will always be in uppercase, ' +
        'while client MAC address will always be in lowercase.' })

  const [
    dhcpOption82SubOption1Enabled,
    dhcpOption82SubOption2Enabled,
    dhcpOption82SubOption150Enabled,
    dhcpOption82SubOption151Enabled,
    dhcpOption82SubOption2Format,
    dhcpOption82SubOption151Format,
    dhcpOption82SubOption1Format,
    dhcpOption82SubOption1Customization
  ] = [
    useWatch<boolean>(dhcpOption82SubOption1EnabledFieldName),
    useWatch<boolean>(dhcpOption82SubOption2EnabledFieldName),
    useWatch<boolean>(dhcpOption82SubOption150EnabledFieldName),
    useWatch<boolean>(dhcpOption82SubOption151EnabledFieldName),
    useWatch<DhcpOption82SubOption2Enum>(dhcpOption82SubOption2FormatFieldName),
    useWatch<DhcpOption82SubOption151Enum>(dhcpOption82SubOption151FormatFieldName),
    useWatch<DhcpOption82SubOption1Enum>(dhcpOption82SubOption1FormatFieldName),
    // eslint-disable-next-line max-len
    useWatch<DhcpOption82SubOption1Customization>(dhcpOption82SubOption1CustomizationFieldName)
  ]

  useEffect(() => {
    if(isLanPortSettings) {
      if (dhcpOption82SubOption1Customization) {
        const transformedTags =
        dhcpOption82SubOption1Customization.attributes.map(
          (attribute: DhcpOption82SubOption1CustomizationAttribute) => {
            if (attribute.type === DhcpOption82SubOption1CustomizationType.USER_DEFINED) {
              return {
                id: attribute.text,
                value: attribute.text,
                isCustom: true,
                valid: true
              } as DraggableTag
            } else {
              return {
                id: attribute.type,
                value: dhcpOption82SubOption1CustomizationTypeLabels[
                    attribute.type as DhcpOption82SubOption1CustomizationType
                ],
                isCustom: false,
                valid: true
              } as DraggableTag
            }
          })
        form.setFieldValue(customizationFieldName, transformedTags)
      }
    }
  }, [dhcpOption82SubOption1Customization])

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
            children={<Switch
              disabled={readOnly}
              data-testid={'dhcpOption82SubOption1-switch'}

            />}
          />
          { dhcpOption82SubOption1Enabled &&
            <Form.Item
              name={dhcpOption82SubOption1FormatFieldName}
              initialValue={Option82SubOption1Enum.SUBOPT1_AP_INFO}
              children={
                <Select
                  disabled={readOnly}
                  options={dhcp82SubOption1Options}
                />
              }
            />
          }
        </div>
      </UI.FieldLabel>
      {
        isLanPortSettings &&
        isDhcpOption82Enabled &&
        Option82SubOption1Enum.SUBOPT1_CUSTOMIZED === dhcpOption82SubOption1Format &&
      <>
        <UI.AsteriskFormTitle>
          {$t({ defaultMessage: 'Custom Attributes' })}
        </UI.AsteriskFormTitle>
        <div style={{
          fontSize: '12px',
          color: cssStr('--acx-neutrals-60')
        }}>
          {$t({ defaultMessage: 'Select attribute from the list or input custom attribute.' })}
        </div>
        <UI.FieldLabelFullWidth>
          <Form.Item>
            <DraggableTagField
              name={customizationFieldName}
              options={Object.values(DhcpOption82SubOption1CustomizationType)
                .filter(option => option !== DhcpOption82SubOption1CustomizationType.USER_DEFINED)
                .map(option => dhcpOption82SubOption1CustomizationTypeLabels[option])}
              maxTags={8}
              readonly={readOnly}
              rules={[{
                validator: async (_, tags?: DraggableTag[]) => {
                  if (!tags || tags.length === 0) {
                    throw new Error($t({ defaultMessage: 'Please add at least one attribute' }))
                  }
                }
              }]}
              onChange={(val) => {
                form.setFieldValue(dhcpOption82SubOption1CustomizationFieldName, {
                  attributes: val.map((tag) => {
                    if(tag.isCustom) {
                      return {
                        type: DhcpOption82SubOption1CustomizationType.USER_DEFINED,
                        text: tag.value
                      }
                    } else {
                    // Find the enum value by label
                      // eslint-disable-next-line max-len
                      const enumValue = Object.entries(dhcpOption82SubOption1CustomizationTypeLabels)
                        .find(([, label]) => label === tag.value)?.[0]
                      return { type: enumValue as DhcpOption82SubOption1CustomizationType }
                    }
                  })
                })
              }}
            />
          </Form.Item>
          <Form.Item name={dhcpOption82SubOption1CustomizationFieldName} hidden />
        </UI.FieldLabelFullWidth>
      </>}
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
            children={<Switch disabled={readOnly} />}
          />
          { dhcpOption82SubOption2Enabled &&
            <Form.Item
              name={dhcpOption82SubOption2FormatFieldName}
              initialValue={Option82SubOption2Enum.SUBOPT2_CLIENT_MAC}
              children={
                <Select
                  disabled={readOnly}
                  options={dhcp82SubOption2Options}
                />
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
          children={<Switch disabled={readOnly} />}
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
            children={<Switch disabled={readOnly} />}
          />
          { dhcpOption82SubOption151Enabled &&
            <Form.Item
              name={dhcpOption82SubOption151FormatFieldName}
              initialValue={Option82SubOption151Enum.SUBOPT151_AREA_NAME}
              children={
                <Select disabled={readOnly}>
                  <Option value={Option82SubOption151Enum.SUBOPT151_AREA_NAME}>
                    {$t({ defaultMessage: 'Area Name' })}
                  </Option>
                  <Option value={Option82SubOption151Enum.SUBOPT151_ESSID}>
                    {$t({ defaultMessage: 'ESSID' })}
                  </Option>
                </Select>
              }
            />
          }
          { Option82SubOption151Enum.SUBOPT151_AREA_NAME === dhcpOption82SubOption151Format &&
            <Form.Item
              name={dhcpOption82SubOption151InputFieldName}
              style={{ marginLeft: '10px' }}
              rules={[
                { required: true, message: $t({ defaultMessage: 'Please enter Area Name' }) },
                { max: 26 }
              ]}
              children={
                <Input style={{ width: '320px' }}
                  disabled={readOnly}
                />
              }
            />
          }
        </div>
      </UI.FieldLabel>
      { (dhcpOption82SubOption1Enabled ||
        (dhcpOption82SubOption2Enabled &&
          Option82SubOption2Enum.SUBOPT2_AP_NAME !== dhcpOption82SubOption2Format) ||
        (dhcpOption82SubOption151Enabled &&
          Option82SubOption151Enum.SUBOPT151_ESSID === dhcpOption82SubOption151Format)) &&
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
          { isLanPortSettings ? <Form.Item
            name={dhcpOption82MacFormat}
            initialValue={DhcpOption82MacDelimiterEnum.COLON}
            children={
              <Select disabled={readOnly}>
                <Option value={DhcpOption82MacDelimiterEnum.COLON}>
                  {$t({ defaultMessage: 'AA:BB:CC:DD:EE:FF' })}
                </Option>
                <Option value={DhcpOption82MacDelimiterEnum.HYPHEN}>
                  {$t({ defaultMessage: 'AA-BB-CC-DD-EE-FF' })}
                </Option>
                <Option value={DhcpOption82MacDelimiterEnum.NONE}>
                  {$t({ defaultMessage: 'AABBCCDDEEFF' })}
                </Option>
              </Select>
            }
          /> :
            <Form.Item
              name={dhcpOption82MacFormat}
              initialValue={DhcpOption82MacEnum.COLON}
              children={
                <Select disabled={readOnly}>
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
            /> }
        </UI.FieldLabel>
      }

      <Form.Item
        name='globalValidation'
        rules={[
          {
            validator: async () => {
              const atLeastOneEnabled = dhcpOption82SubOption1Enabled ||
                                       dhcpOption82SubOption2Enabled ||
                                       dhcpOption82SubOption150Enabled ||
                                       dhcpOption82SubOption151Enabled

              if (!atLeastOneEnabled) {
                throw new Error($t({
                  defaultMessage: 'At least one DHCP Option 82 sub-option must be enabled'
                }))
              }
            }
          }
        ]}
      />
    </>
  )
}
