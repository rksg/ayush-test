import React, { useEffect, useState } from 'react'

import { Checkbox, Form, FormInstance, FormItemProps, Input, Select, Slider } from 'antd'
import { useIntl }                                                            from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps }      from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { AccessStatus, DeviceTypeEnum, OsVendorEnum } from '@acx-ui/rc/utils'

import { deviceTypeLabelMapping, osVenderLabelMapping } from '../../../contentsMap'

import {
  deviceOsVendorMappingTable,
  getDeviceOsVendorMap,
  getDeviceTypeOptions,
  getOsVendorOptions,
  isDeviceOSEnabled, isDeviceTypeEnabled
} from './DeviceOSDrawerUtils'

interface DeviceOSRuleContentProps {
  drawerForm: FormInstance,
  deviceOSRuleList: DeviceOSRule[],
  ruleDrawerEditMode: boolean
}

export const DrawerFormItem = (props: FormItemProps) => {
  return (
    <Form.Item
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      style={{ marginBottom: '5px' }}
      {...props} />
  )
}

interface DeviceOSRule {
  ruleName: string,
  deviceType: string,
  osVendor: string,
  access: string,
  details: {
    vlan: number,
    upLink: number,
    downLink: number
  }
}

const { useWatch } = Form

const DeviceOSRuleContent = (props: DeviceOSRuleContentProps) => {
  const { $t } = useIntl()
  const { drawerForm, deviceOSRuleList, ruleDrawerEditMode } = props
  const [deviceType, setDeviceType] = useState(
    drawerForm.getFieldValue('deviceType') as DeviceTypeEnum
  )
  const [osVendor, setOsVendor] = useState(
    drawerForm.getFieldValue('osVendor') as OsVendorEnum
  )
  const [deviceOSMappingTable] = useState(
    deviceOsVendorMappingTable(
      getDeviceOsVendorMap(), deviceOSRuleList
    ) as { [key: string]: string[] }
  )

  const [
    access
  ] = [
    useWatch<string>('access', drawerForm)
  ]
  const [osVendorOptionList, setOsVendorOptionList] = useState([] as {
    value: string, label: string
  }[])
  const [fromClient, setFromClient] = useState(
    ruleDrawerEditMode ? drawerForm.getFieldValue('fromClient') : false
  )
  const [fromClientValue, setFromClientValue] = useState(
    ruleDrawerEditMode ? drawerForm.getFieldValue('fromClientValue') : 200
  )
  const [toClient, setToClient] = useState(
    ruleDrawerEditMode ? drawerForm.getFieldValue('toClient') : false
  )
  const [toClientValue, setToClientValue] = useState(
    ruleDrawerEditMode ? drawerForm.getFieldValue('toClientValue') : 200
  )

  const isNewOsVendorFeatureEnabled = useIsSplitOn(Features.NEW_OS_VENDOR_IN_DEVICE_POLICY)

  useEffect(() => {
    const tempOsVendor = drawerForm.getFieldValue('tempOsVendor')
    setOsVendorOptionList([
      { value: 'Please select...', label: $t({ defaultMessage: 'Please select...' }) },
      ...getOsVendorOptions(deviceType)
        .filter(option => deviceType !== DeviceTypeEnum.Gaming ||
          !(isNewOsVendorFeatureEnabled ?
            [OsVendorEnum.Xbox360, OsVendorEnum.PlayStation2, OsVendorEnum.PlayStation3] :
            [OsVendorEnum.PlayStation]).includes(option))
        .map(option => ({
          value: option,
          label: $t(osVenderLabelMapping[option as OsVendorEnum]),
          disabled: isDeviceOSEnabled(
            deviceType,
            option,
            deviceOSMappingTable,
            ruleDrawerEditMode ? tempOsVendor : '')
        }))
    ] as { value: string, label: string }[])
  }, [deviceType, osVendor])

  useEffect(() => {
    if (fromClient) {
      drawerForm.setFieldValue('fromClientValue', fromClientValue)
    }
    if (toClient) {
      drawerForm.setFieldValue('toClientValue', toClientValue)
    }
  }, [fromClient, toClient])

  const EmptyElement = (props: { access: AccessStatus }) => {
    drawerForm.setFieldValue('deviceOSAccess', props.access)
    return <></>
  }

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    {
      label: $t({ defaultMessage: 'Allow Traffic' }),
      children: <EmptyElement access={AccessStatus.ALLOW} />,
      value: AccessStatus.ALLOW
    },
    {
      label: $t({ defaultMessage: 'Block Traffic' }),
      children: <EmptyElement access={AccessStatus.BLOCK} />,
      value: AccessStatus.BLOCK
    }
  ]

  const handleOsVendorChange = (value: OsVendorEnum) => {
    setOsVendor(value)
  }

  const handleDeviceTypeChange = (value: DeviceTypeEnum) => {
    setDeviceType(value)
    drawerForm.resetFields(['osVendor'])
  }

  const rateLimitContent = <div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '150px' }}>
        <Checkbox
          checked={fromClient}
          onChange={() => {
            drawerForm.setFieldValue('fromClient', !fromClient)
            drawerForm.setFieldValue('fromClientValue', 200)
            setFromClient(!fromClient)
            setFromClientValue(200)
          }}>
          {$t({ defaultMessage: 'From Client:' })}
        </Checkbox>
      </span>
      <Slider
        style={{
          display: fromClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0.1: '0.1 Mbps', 200: '200 Mbps' }}
        step={0.1}
        min={0.1}
        max={200}
        defaultValue={fromClientValue ?? 200}
        onChange={(value) => {
          drawerForm.setFieldValue('fromClientValue', value)
          setFromClientValue(value)
        }}
      />
    </div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '150px' }}>
        <Checkbox
          checked={toClient}
          onChange={() => {
            drawerForm.setFieldValue('toClient', !toClient)
            drawerForm.setFieldValue('toClientValue', 200)
            setToClient(!toClient)
            setToClientValue(200)
          }}>
          {$t({ defaultMessage: 'To Client:' })}
        </Checkbox>
      </span>
      <Slider
        style={{
          display: toClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0.1: '0.1 Mbps', 200: '200 Mbps' }}
        step={0.1}
        min={0.1}
        max={200}
        defaultValue={toClientValue ?? 200}
        onChange={(value) => {
          drawerForm.setFieldValue('toClientValue', value)
          setToClientValue(value)
        }}
      />
    </div>
  </div>


  return <Form layout='horizontal' form={drawerForm}>
    <DrawerFormItem
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      initialValue={''}
      validateFirst
      rules={[
        { required: true },
        { min: 2 },
        { max: 32 },
        { validator: (_, value) => {
          if (deviceOSRuleList
            .filter((rule: DeviceOSRule) => ruleDrawerEditMode ? (rule.ruleName !== value) : true)
            .findIndex((rule: DeviceOSRule) => rule.ruleName === value) !== -1) {
            return Promise.reject('The rule name has already used')
          }
          return Promise.resolve()
        }
        }
      ]}
      children={<Input />}
    />
    <DrawerFormItem
      name='access'
      label={$t({ defaultMessage: 'Access' })}
      initialValue={AccessStatus.ALLOW}
      children={<ContentSwitcher tabDetails={tabDetails} size='large' />}
    />
    <DrawerFormItem
      name='deviceType'
      label={$t({ defaultMessage: 'Device Type' })}
      initialValue={$t({ defaultMessage: 'Select...' })}
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (value === 'Select...') {
            return Promise.reject('Please select the deviceType option')
          }
          return Promise.resolve()
        }
        }
      ]}
      children={<Select
        style={{ width: '100%' }}
        onChange={handleDeviceTypeChange}
        options={[
          { value: 'Select...', label: $t({ defaultMessage: 'Select...' }) },
          ...getDeviceTypeOptions().map(option => ({
            value: option,
            label: $t(deviceTypeLabelMapping[option as DeviceTypeEnum]),
            disabled: isDeviceTypeEnabled(option, deviceOSMappingTable)
          }))
        ]}
      />}
    />
    <DrawerFormItem
      name='osVendor'
      label={$t({ defaultMessage: 'OS Vender' })}
      initialValue={$t({ defaultMessage: 'Please select...' })}
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (value === 'Please select...') {
            return Promise.reject('Please select the osVendor option')
          }
          return Promise.resolve()
        }
        }
      ]}
      children={<Select
        style={{ width: '100%' }}
        onChange={handleOsVendorChange}
        options={osVendorOptionList}
      />}
    />
    {access !== AccessStatus.BLOCK && <DrawerFormItem
      name='rateLimit'
      label={$t({ defaultMessage: 'Rate Limit' })}
      initialValue={''}
      children={rateLimitContent}
    />}
    {access !== AccessStatus.BLOCK && <DrawerFormItem
      name='vlan'
      label={$t({ defaultMessage: 'VLAN' })}
      initialValue={''}
      children={<Input />}
    />}
  </Form>
}

export default DeviceOSRuleContent
