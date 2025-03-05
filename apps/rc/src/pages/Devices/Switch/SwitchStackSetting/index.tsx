import { useEffect, useState } from 'react'

import { Form, Select, Space, Typography, Radio, RadioChangeEvent, Input, Switch, InputNumber } from 'antd'
import { DefaultOptionType }                                                                    from 'antd/lib/select'
import { FormattedMessage, useIntl }                                                            from 'react-intl'

import { showActionModal, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import {
  checkVlanDiffFromTargetVlan
} from '@acx-ui/rc/components'
import {
  FlexAuthMessages,
  FlexAuthVlanLabel,
  IP_ADDRESS_TYPE,
  IGMP_SNOOPING_TYPE,
  isL3FunctionSupported,
  isFirmwareVersionAbove10010f,
  validateSwitchIpAddress,
  validateSwitchSubnetIpAddress,
  validateSwitchGatewayIpAddress,
  validateVlanExcludingReserved,
  SwitchViewModel,
  SWITCH_DEFAULT_VLAN_NAME,
  isFirmwareVersionAbove10010g2Or10020b
} from '@acx-ui/rc/utils'

import StaticRoutes      from './StaticRoutes'
import { JumboModeSpan } from './styledComponents'

const spanningTreePriorityItem = [
  { label: '0 - likely root', value: 0 },
  { label: '4096', value: 4096 },
  { label: '8192', value: 8192 },
  { label: '12288', value: 12288 },
  { label: '16384', value: 16384 },
  { label: '20480', value: 20480 },
  { label: '24576', value: 24576 },
  { label: '28672', value: 28672 },
  { label: '32768 - default', value: 32768 },
  { label: '36864', value: 36864 },
  { label: '40960', value: 40960 },
  { label: '45056', value: 45056 },
  { label: '49152', value: 49152 },
  { label: '53248', value: 53248 },
  { label: '57344', value: 57344 },
  { label: '61440', value: 61440 }
]

export function SwitchStackSetting (props: {
  switchDetail?: SwitchViewModel,
  apGroupOption: DefaultOptionType[],
  readOnly: boolean,
  isIcx7650?: boolean,
  disableIpSetting: boolean,
  deviceOnline?: boolean
}) {
  const { $t } = useIntl()
  const { apGroupOption, readOnly, isIcx7650, disableIpSetting, deviceOnline, switchDetail } = props
  const form = Form.useFormInstance()

  const vlanMapping = JSON.parse(switchDetail?.vlanMapping ?? '{}')
  const defaultVlan
    = Object.keys(vlanMapping).find(key => vlanMapping[key] === SWITCH_DEFAULT_VLAN_NAME) ?? ''

  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const isSwitchFirmwareAbove10010f = isFirmwareVersionAbove10010f(switchDetail?.firmware)

  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)
  const isSwitchFirmwareAbove10010gOr10020b =
    isFirmwareVersionAbove10010g2Or10020b(switchDetail?.firmware)

  const { useWatch } = Form
  const [authEnable, authDefaultVlan, portSecurity] = [
    useWatch<string>('authEnable', form),
    useWatch<string>('authDefaultVlan', form),
    useWatch<boolean>('portSecurity', form)
  ]

  const [enableDhcp, setEnableDhcp] = useState(false)
  const [isL3ConfigAllowed, setIsL3ConfigAllowed] = useState(false)
  const [ipAddressInterfaceType, setIpAddressInterfaceType] = useState('VE')
  const [ipAddressInterface, setIpAddressInterface] = useState('1')

  const onIpAddressTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === IP_ADDRESS_TYPE.DYNAMIC && form.getFieldValue('dhcpServerEnabled')) {
      form.setFieldValue('ipAddressType', IP_ADDRESS_TYPE.STATIC)
      showActionModal({
        type: 'info',
        title: $t({ defaultMessage: 'DHCP Server is Enabled' }),
        content: $t({ defaultMessage: `
          This switch can no longer act as a DHCP client since DHCP Server is enabled.
          Configure DHCP service state and try again.` })
      })
      return
    }
    setEnableDhcp(e.target.value === IP_ADDRESS_TYPE.DYNAMIC)
  }

  useEffect(()=>{
    if(form.getFieldValue('ipAddressType')) {
      setEnableDhcp(form.getFieldValue('ipAddressType') === IP_ADDRESS_TYPE.DYNAMIC)
    }

    if(form.getFieldValue('switchType')){
      setIsL3ConfigAllowed(isL3FunctionSupported(form.getFieldValue('switchType')))
    }

    if(form.getFieldValue('ipAddressInterfaceType')){
      setIpAddressInterfaceType(form.getFieldValue('ipAddressInterfaceType'))
    }

    if(form.getFieldValue('ipAddressInterface')){
      setIpAddressInterface(form.getFieldValue('ipAddressInterface'))
    }
  }, [
    form.getFieldValue('ipAddressType'),
    form.getFieldValue('switchType'),
    form.getFieldValue('ipAddressInterfaceType'),
    form.getFieldValue('ipAddressInterface')
  ])

  const onEditJumboMode = (checked: boolean) => {
    showActionModal({
      type: 'info',
      title: $t({ defaultMessage: 'Switch Reboot is Required' }),
      content: (<FormattedMessage
        defaultMessage={`
            {status} the jumbo mode option will
            cause the switch to reboot once the settings are applied`
        }
        values={{
          status: checked ?
            $t({ defaultMessage: 'Enabling' }) :
            $t({ defaultMessage: 'Disabling' })
        }}
      />)
    })
  }

  const onPortSecurityMaxEntriesChange = (value: number | null) => {
    if (value && switchDetail?.portSecurityMaxEntries &&
      value < switchDetail.portSecurityMaxEntries) {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Delete Sticky MAC Allow List?' }),
        content: $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'The value you have set is lower than some of the values configured in the port\'s Sticky MAC List Size Limit. To proceed, the system will need to delete all the current Sticky MAC Allow List entries on the ports. Are you sure you want to delete them?'
        }),
        okText: $t({ defaultMessage: 'Delete' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        onCancel: () => {
          form.setFieldsValue({ portSecurityMaxEntries: switchDetail?.portSecurityMaxEntries })
        }
      })
    }
  }

  return (
    <>
      <Form.Item
        name='initialVlanId'
        label={
          <>
            {$t({ defaultMessage: 'DHCP Client' })}
            <Tooltip.Question
              title={$t({
                defaultMessage:
                            // eslint-disable-next-line max-len
                            'DHCP Client interface will only be applied to factory default switches. Switches with pre-existing configuration will not get this change to prevent connectivity loss.'
              })}
              placement='bottom'
            />
          </>
        }
        initialValue={null}
        children={
          <Select
            disabled={readOnly || apGroupOption?.length === 0}
            options={[
              {
                label: $t({ defaultMessage: 'Select VLAN...' }),
                value: null
              },
              ...apGroupOption
            ]}
          />
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'IP Assignment' })}
        name='ipAddressType'
        initialValue={'dynamic'}
        rules={[
          { required: true, warningOnly: !deviceOnline }
        ]}
      >
        <Radio.Group disabled={readOnly || disableIpSetting} onChange={onIpAddressTypeChange}>
          <Space direction='vertical'>
            <Radio key='dynamic' value='dynamic'>
              {$t({ defaultMessage: 'DHCP' })}
            </Radio>
            <Radio key='static'
              value='static'>
              {$t({ defaultMessage: 'Static/Manual' })}
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label={
          <>
            {$t({ defaultMessage: 'IP Address' })}
            {isL3ConfigAllowed &&
            <Tooltip.Question
              title={$t({ defaultMessage:
                'This IP address is the {ipAddressInterfaceType} {ipAddressInterface} IP address' },
              { ipAddressInterfaceType, ipAddressInterface })}
              placement='bottom'
            />}
          </>
        }
        name='ipAddress'
        rules={[
          { required: !enableDhcp, warningOnly: !deviceOnline },
          { validator: (_, value) =>{
            if(!enableDhcp && deviceOnline) {
              return validateSwitchIpAddress(value)
            } else {
              return Promise.resolve()
            }
          }
          }
        ]}
      >
        <Input
          disabled={readOnly || enableDhcp}/>
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Subnet Mask' })}
        name='subnetMask'
        rules={[
          { required: !enableDhcp, warningOnly: !deviceOnline },
          { validator: (_, value) => {
            if(!enableDhcp && deviceOnline) {
              return validateSwitchSubnetIpAddress(form.getFieldValue('ipAddress'), value)
            } else {
              return Promise.resolve()
            }
          }
          }
        ]}
      >
        <Input disabled={readOnly || enableDhcp} />
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Default Gateway' })}
        name='defaultGateway'
        rules={[
          { required: !enableDhcp, warningOnly: !deviceOnline },
          { validator: (_, value) => {
            if(!enableDhcp && deviceOnline) {
              return validateSwitchGatewayIpAddress(
                form.getFieldValue('ipAddress'), form.getFieldValue('subnetMask'), value)
            } else {
              return Promise.resolve()
            }
          }
          }
        ]}
      >
        <Input disabled={readOnly || enableDhcp} />
      </Form.Item>

      <Form.Item>
        <JumboModeSpan>{$t({ defaultMessage: 'Jumbo Mode' })}</JumboModeSpan>
        <Form.Item noStyle name='jumboMode' valuePropName='checked'>
          <Switch disabled={readOnly} onClick={onEditJumboMode} />
        </Form.Item>
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'IGMP Snooping' })}
        name='igmpSnooping'
        rules={[
          { required: true, warningOnly: !deviceOnline }
        ]}
      >
        <Radio.Group disabled={readOnly}>
          <Space direction='vertical'>
            <Radio key={IGMP_SNOOPING_TYPE.ACTIVE} value={IGMP_SNOOPING_TYPE.ACTIVE}>
              {$t({ defaultMessage: 'Active' })}
            </Radio>
            <Radio key={IGMP_SNOOPING_TYPE.PASSIVE} value={IGMP_SNOOPING_TYPE.PASSIVE}>
              {$t({ defaultMessage: 'Passive' })}
            </Radio>
            <Radio key={IGMP_SNOOPING_TYPE.NONE} value={IGMP_SNOOPING_TYPE.NONE}>
              {$t({ defaultMessage: 'None' })}
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Spanning Tree Priority' })}
        name={'spanningTreePriority'}
        initialValue={''}
        children={<Select
          options={[
            {
              label: $t({ defaultMessage: 'Select Priority...' }),
              value: ''
            },
            ...spanningTreePriorityItem]}
          disabled={readOnly}
        />}
      />
      {
        isSwitchMacAclEnabled && isSwitchFirmwareAbove10010gOr10020b && <Form.Item>
          <JumboModeSpan>{$t({ defaultMessage: 'Port MAC Security' })}</JumboModeSpan>
          <Form.Item noStyle name='portSecurity' valuePropName='checked'>
            <Switch disabled={readOnly} />
          </Form.Item>
        </Form.Item>
      }
      { portSecurity &&
      <Form.Item
        name='portSecurityMaxEntries'
        label={$t({ defaultMessage: 'Sticky MAC List Size Limit' })}
        initialValue='1'
        rules={[
          {
            type: 'number',
            min: 1,
            max: 8192
          }
        ]}
        validateFirst
        children={<InputNumber
          min={1}
          max={8192}
          data-testid='port-security-max-entries-input'
          onChange={onPortSecurityMaxEntriesChange}
          style={{ width: '100%' }}
        />}
      />
      }
      { isIcx7650 &&
      <Form.Item>
        <JumboModeSpan>{$t({ defaultMessage: 'Stack with 40G ports on module 3:' })}</JumboModeSpan>
        <Form.Item noStyle name='rearModuleOption' valuePropName='checked'>
          <Switch disabled={readOnly} />
        </Form.Item>
      </Form.Item>
      }
      { switchDetail && isL3ConfigAllowed &&
        <StaticRoutes readOnly={readOnly} switchDetail={switchDetail}/> }
      {
        isSwitchFlexAuthEnabled && isSwitchFirmwareAbove10010f && <>
          <Space size={8} style={{ display: 'flex', margin: '40px 0 30px' }}>
            <Typography.Text style={{ display: 'flex', fontSize: '12px' }}>
              {$t({ defaultMessage: 'Authentication' })}
            </Typography.Text>
            <Form.Item
              noStyle
              name='authEnable'
              valuePropName='checked'
              children={<Switch disabled={readOnly} style={{ display: 'flex' }} />}
            />
          </Space>
          { authEnable && <>
            <Form.Item
              name='authDefaultVlan'
              label={$t({ defaultMessage: 'Auth Default VLAN' })}
              validateFirst
              rules={[
                { required: true },
                { validator: (_, value) => validateVlanExcludingReserved(value) },
                { validator: (_, value) =>
                  checkVlanDiffFromTargetVlan(
                    value, defaultVlan,
                    $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                      sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
                    })
                  )
                }
              ]}
              children={
                <Input disabled={readOnly} />
              }
            />
            <Form.Item
              name='guestVlan'
              label={$t({ defaultMessage: 'Guest VLAN' })}
              validateFirst
              rules={[
                { validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve()
                  }
                  return validateVlanExcludingReserved(value)
                }
                },
                { validator: (_, value) =>
                  checkVlanDiffFromTargetVlan(
                    value, defaultVlan,
                    $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                      sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
                    })
                  )
                },
                { validator: (_, value) =>
                  checkVlanDiffFromTargetVlan(
                    value, authDefaultVlan,
                    $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                      sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                      targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
                    })
                  )
                }
              ]}
              children={
                <Input disabled={readOnly} />
              }
            />
          </>}
        </>
      }
    </>
  )
}
