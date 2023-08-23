import { useEffect, useState } from 'react'

import { Form, Select, Radio, Space, RadioChangeEvent, Input, Switch } from 'antd'
import { DefaultOptionType }                                           from 'antd/lib/select'
import { FormattedMessage, useIntl }                                   from 'react-intl'

import { showActionModal, Tooltip } from '@acx-ui/components'
import {
  IP_ADDRESS_TYPE,
  IGMP_SNOOPING_TYPE,
  isL3FunctionSupported,
  validateSwitchIpAddress,
  validateSwitchSubnetIpAddress,
  validateSwitchGatewayIpAddress
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

export function SwitchStackSetting
(props: { apGroupOption: DefaultOptionType[], readOnly: boolean,
  isIcx7650?: boolean, disableIpSetting: boolean }) {
  const { $t } = useIntl()
  const { apGroupOption, readOnly, isIcx7650, disableIpSetting } = props
  const form = Form.useFormInstance()

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
          { required: true }
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
          { required: !enableDhcp },
          { validator: (_, value) =>{
            if(!enableDhcp) {
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
          { required: !enableDhcp },
          { validator: (_, value) => {
            if(!enableDhcp) {
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
          { required: !enableDhcp },
          { validator: (_, value) => {
            if(!enableDhcp) {
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
          { required: true }
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
      { isIcx7650 &&
      <Form.Item>
        <JumboModeSpan>{$t({ defaultMessage: 'Stack with 40G ports on module 3:' })}</JumboModeSpan>
        <Form.Item noStyle name='rearModuleOption' valuePropName='checked'>
          <Switch disabled={readOnly} />
        </Form.Item>
      </Form.Item>
      }
      { isL3ConfigAllowed && <StaticRoutes readOnly={readOnly} /> }
    </>
  )
}
