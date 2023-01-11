import { useEffect, useState } from 'react'

import { Form, Select, Tooltip, Radio, Space, RadioChangeEvent, Input, Switch } from 'antd'
import { DefaultOptionType }                                                    from 'antd/lib/select'
import { useIntl }                                                              from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
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
(props: { apGroupOption: DefaultOptionType[], readOnly: boolean }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { apGroupOption, readOnly } = props
  const [enableDhcp, setEnableDhcp] = useState(false)
  const [isL3ConfigAllowed, setIsL3ConfigAllowed] = useState(false)
  const [ipAddressInterfaceType, setIpAddressInterfaceType] = useState('VE')
  const [ipAddressInterface, setIpAddressInterface] = useState('1')

  const onIpAddressTypeChange = (e: RadioChangeEvent) => {
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

  return (
    <>
      <Form.Item
        name='initialVlanId'
        label={
          <>
            {$t({ defaultMessage: 'DHCP Client' })}
            <Tooltip
              title={$t({
                defaultMessage:
                            // eslint-disable-next-line max-len
                            'DHCP Client interface will only be applied to factory default switches. Switches with pre-existing configuration will not get this change to prevent connectivity loss.'
              })}
              placement='bottom'
            >
              <QuestionMarkCircleOutlined />
            </Tooltip>
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
        rules={[
          { required: true }
        ]}
      >
        <Radio.Group disabled={readOnly} onChange={onIpAddressTypeChange}>
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
            <Tooltip
              title={$t({ defaultMessage:
                'This IP address is the {ipAddressInterfaceType} {ipAddressInterface} IP address' },
              { ipAddressInterfaceType, ipAddressInterface })}
              placement='bottom'
            >
              <QuestionMarkCircleOutlined />
            </Tooltip>}
          </>
        }
        name='ipAddress'
        rules={[
          { required: true },
          { validator: (_, value) =>
            validateSwitchIpAddress(value) }
        ]}
      >
        <Input
          disabled={readOnly || enableDhcp}/>
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Subnet Mask' })}
        name='subnetMask'
        rules={[
          { required: true },
          { validator: (_, value) =>
            validateSwitchSubnetIpAddress(form.getFieldValue('ipAddress'), value) }
        ]}
      >
        <Input disabled={readOnly || enableDhcp} />
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Default Gateway' })}
        name='defaultGateway'
        rules={[
          { required: true },
          { validator: (_, value) =>
            validateSwitchGatewayIpAddress(
              form.getFieldValue('ipAddress'), form.getFieldValue('subnetMask'), value) }
        ]}
      >
        <Input disabled={readOnly || enableDhcp} />
      </Form.Item>

      <Form.Item>
        <JumboModeSpan>{$t({ defaultMessage: 'Jumbo Mode' })}</JumboModeSpan>
        <Form.Item noStyle name='jumboMode' valuePropName='checked'>
          <Switch disabled={readOnly} />
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
        label={$t({ defaultMessage: 'Select Profile' })}
        name={'spanningTreePriority'}
        children={<Select
          defaultValue={''}
          options={[
            {
              label: $t({ defaultMessage: 'Select Priority...' }),
              value: ''
            },
            ...spanningTreePriorityItem]}
          disabled={readOnly}
        />}
      />

      { isL3ConfigAllowed && <StaticRoutes readOnly={readOnly} /> }
    </>
  )
}