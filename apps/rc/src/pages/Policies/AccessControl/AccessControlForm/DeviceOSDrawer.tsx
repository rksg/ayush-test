import React, { useState } from 'react'

import { Checkbox, Form, Input, Select, Slider } from 'antd'
import { useIntl }                               from 'react-intl'

import { Button, Drawer, showActionModal, Table, TableProps } from '@acx-ui/components'
import { DownloadOutlined }                                   from '@acx-ui/icons'

const { useWatch } = Form

interface DeviceOSRule {
  ruleName: string,
  deviceType: string,
  osVendor: string,
  access: string,
  details: {
    vlan: string,
    upLink: number,
    downLink: number
  }
}

enum DeviceTypeEnum {
  Laptop = 'Laptop',
  Smartphone = 'Smartphone',
  Tablet = 'Tablet',
  Voip = 'Voip',
  Gaming = 'Gaming',
  Printer = 'Printer',
  IotDevice = 'IotDevice',
  HomeAvEquipment = 'HomeAvEquipment',
  WdsDevice = 'WdsDevice',
}

enum OsVendorEnum {
  All = 'All',
  Windows = 'Windows',
  MacOs = 'MacOs',
  ChromeOs = 'ChromeOs',
  Linux = 'Linux',
  Ubuntu = 'Ubuntu',
  Ios = 'Ios',
  Android = 'Android',
  BlackBerry = 'BlackBerry',
  AmazonKindle = 'AmazonKindle',
  CiscoIpPhone = 'CiscoIpPhone',
  AvayaIpPhone = 'AvayaIpPhone',
  LinksysPapVoip = 'LinksysPapVoip',
  NortelIpPhone = 'NortelIpPhone',
  Xbox360 = 'Xbox360',
  PlayStation2 = 'PlayStation2',
  GameCube = 'GameCube',
  Wii = 'Wii',
  PlayStation3 = 'PlayStation3',
  Xbox = 'Xbox',
  Nintendo = 'Nintendo',
  HpPrinter = 'HpPrinter',
  CanonPrinter = 'CanonPrinter',
  XeroxPrinter = 'XeroxPrinter',
  DellPrinter = 'DellPrinter',
  BrotherPrinter = 'BrotherPrinter',
  EpsonPrinter = 'EpsonPrinter',
  NestCamera = 'NestCamera',
  NestThermostat = 'NestThermostat',
  WemoSmartSwitch = 'WemoSmartSwitch',
  WifiSmartPlug = 'WifiSmartPlug',
  SonyPlayer = 'SonyPlayer',
  PanasonicG20Tv = 'PanasonicG20Tv',
  SamsungSmartTv = 'SamsungSmartTv',
  AppleTv = 'AppleTv',
  LibratoneSpeakers = 'LibratoneSpeakers',
  BoseSpeakers = 'BoseSpeakers',
  SonosSpeakers = 'SonosSpeakers',
  RokuStreamingStick = 'RokuStreamingStick',
  TelnetCpe = 'TelnetCpe',
}

const getDeviceTypeOptions = () => {
  return ['Select...', ...Object.keys(DeviceTypeEnum)]
}

const getOsVendorOptions = (deviceType: DeviceTypeEnum) => {
  let OsVendorArray = ['Please select...']
  switch (deviceType) {
    case DeviceTypeEnum.Laptop:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Windows, OsVendorEnum.MacOs, OsVendorEnum.ChromeOs, OsVendorEnum.Linux, OsVendorEnum.Ubuntu]
      break
    case DeviceTypeEnum.Smartphone:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.Android, OsVendorEnum.BlackBerry, OsVendorEnum.Windows]
      break
    case DeviceTypeEnum.Tablet:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.AmazonKindle, OsVendorEnum.Android, OsVendorEnum.Windows]
      break
    case DeviceTypeEnum.Voip:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.CiscoIpPhone, OsVendorEnum.AvayaIpPhone, OsVendorEnum.LinksysPapVoip, OsVendorEnum.NortelIpPhone]
      break
    case DeviceTypeEnum.Gaming:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Xbox360, OsVendorEnum.PlayStation2, OsVendorEnum.GameCube, OsVendorEnum.Wii, OsVendorEnum.PlayStation3, OsVendorEnum.Xbox, OsVendorEnum.Nintendo]
      break
    case DeviceTypeEnum.Printer:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.HpPrinter, OsVendorEnum.CanonPrinter, OsVendorEnum.XeroxPrinter, OsVendorEnum.DellPrinter, OsVendorEnum.BrotherPrinter, OsVendorEnum.EpsonPrinter]
      break
    case DeviceTypeEnum.IotDevice:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.NestCamera, OsVendorEnum.NestThermostat, OsVendorEnum.WemoSmartSwitch, OsVendorEnum.WifiSmartPlug]
      break
    case DeviceTypeEnum.HomeAvEquipment:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.SonyPlayer, OsVendorEnum.PanasonicG20Tv, OsVendorEnum.SamsungSmartTv, OsVendorEnum.AppleTv, OsVendorEnum.LibratoneSpeakers, OsVendorEnum.BoseSpeakers, OsVendorEnum.SonosSpeakers, OsVendorEnum.RokuStreamingStick]
      break
    case DeviceTypeEnum.WdsDevice:
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.TelnetCpe]
      break
  }
  return OsVendorArray
}


const DeviceOSDrawer = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(true)
  const form = Form.useFormInstance()
  const [deviceOSDrawerVisible, setDeviceOSDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [deviceOSRuleList, setDeviceOSRuleList] = useState(
    form.getFieldValue(['accessControlComponent', 'deviceOS', 'ruleList']) ?? [] as DeviceOSRule[]
  )
  const [deviceType, setDeviceType] = useState('' as DeviceTypeEnum)
  const [osVendor, setOsVendor] = useState('' as OsVendorEnum)
  const [deviceOSRule, setDeviceOSRule] = useState({} as DeviceOSRule)
  const [fromClient, setFromClient] = useState(false)
  const [fromClientValue, setFromClientValue] = useState(0)
  const [toClient, setToClient] = useState(false)
  const [toClientValue, setToClientValue] = useState(0)
  const [drawerForm] = Form.useForm()

  const [
    defaultAccessStatus,
    accessStatus
  ] = [
    useWatch<string>(['accessControlComponent', 'deviceOS', 'defaultAccess']),
    useWatch<string>(['accessControlComponent', 'deviceOS', 'access'])
  ]

  const renderDetailsColumn = (row: DeviceOSRule) => {
    const linkArray = []
    if (row.details.upLink >= 0) {
      linkArray.push(`UpLink - ${row.details.upLink} Mbps`)
    }
    if (row.details.downLink >= 0) {
      linkArray.push(`DownLink - ${row.details.downLink} Mbps`)
    }
    return <div style={{ display: 'flex', flexDirection: 'column' }}>
      {row.details.vlan && <span>VLAN: {row.details.vlan}</span>}
      <span style={{ whiteSpace: 'nowrap' }}>
        {linkArray.length ? 'Rate Limit: ' : ''}
        {linkArray.join(' | ')}
      </span>
    </div>
  }

  const basicColumns: TableProps<DeviceOSRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Rule Name' }),
      dataIndex: 'ruleName',
      key: 'ruleName'
    },
    {
      title: $t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceType',
      key: 'deviceType'
    },
    {
      title: $t({ defaultMessage: 'OS Vendor' }),
      dataIndex: 'osVendor',
      key: 'osVendor'
    },
    {
      title: $t({ defaultMessage: 'Access' }),
      dataIndex: 'access',
      key: 'access',
      render: (data, row) => {
        return row.access
      }
    },
    {
      title: $t({ defaultMessage: 'Details' }),
      dataIndex: 'details',
      key: 'details',
      render: (data, row) => {
        return renderDetailsColumn(row)
      }
    }
  ]

  const handleAddAction = () => {
    setDeviceOSDrawerVisible(true)
    drawerForm.resetFields()
  }

  const handleRuleDrawerClose = () => {
    setDeviceOSDrawerVisible(false)
    setRuleDrawerEditMode(false)
    setDeviceType('' as DeviceTypeEnum)
    setToClient(false)
    setToClientValue(0)
    setFromClient(false)
    setFromClientValue(0)
    setDeviceOSRule({} as DeviceOSRule)
  }

  const handleDeviceOSDrawerClose = () => {
    setVisible(false)
    setDeviceOSRuleList(form.getFieldValue(['accessControlComponent', 'deviceOS', 'ruleList']))
  }

  const handleOsVendorChange = (value: OsVendorEnum) => {
    setOsVendor(value)
  }

  const handleDeviceTypeChange = (value: DeviceTypeEnum) => {
    setDeviceType(value)
  }

  const handleEditDetailsInfo = (rule: DeviceOSRule) => {
    drawerForm.setFieldValue('details', rule.details)
    drawerForm.setFieldValue('vlan', rule.details.vlan)
    if (rule.details.upLink !== -1) {
      setFromClient(true)
      setFromClientValue(rule.details.upLink)
    }
    if (rule.details.downLink !== -1) {
      setToClient(true)
      setToClientValue(rule.details.downLink)
    }
  }

  const handleDeviceOSRule = () => {
    setRuleDrawerEditMode(false)

    const ruleObject = {
      ruleName: drawerForm.getFieldValue('ruleName'),
      access: form.getFieldValue(['accessControlComponent', 'deviceOS', 'access']),
      deviceType: drawerForm.getFieldValue('deviceType'),
      osVendor: drawerForm.getFieldValue('osVendor'),
      details: {
        vlan: drawerForm.getFieldValue('vlan') ?? '',
        upLink: fromClient ? fromClientValue : -1,
        downLink: toClient ? toClientValue : -1
      }
    }

    if (ruleDrawerEditMode) {
      const ruleIdx = deviceOSRuleList.findIndex((rule: DeviceOSRule) =>
        rule.ruleName === deviceOSRule.ruleName
      )
      deviceOSRuleList[ruleIdx] = ruleObject
      setDeviceOSRuleList([
        ...deviceOSRuleList
      ])
    } else {
      setDeviceOSRuleList([
        ...deviceOSRuleList, ruleObject
      ])
    }
  }

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }]

  const rowActions: TableProps<DeviceOSRule>['actions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([editRow]: DeviceOSRule[], clearSelection: () => void) => {
      setDeviceOSDrawerVisible(true)
      setRuleDrawerEditMode(true)
      setDeviceOSRule(editRow)
      drawerForm.setFieldValue('ruleName', editRow.ruleName)
      drawerForm.setFieldValue('deviceType', editRow.deviceType)
      drawerForm.setFieldValue('osVendor', editRow.osVendor)
      handleEditDetailsInfo(editRow)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([{ ruleName }]: DeviceOSRule[], clearSelection: () => void) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: ruleName
        },
        onOk: () => {
          setDeviceOSRuleList([
            ...deviceOSRuleList.filter((rule: DeviceOSRule) =>
              rule.ruleName !== ruleName
            )
          ])
          clearSelection()
        }
      })
    }
  }] as { label: string, onClick: () => void }[]

  const rateLimitContent = <div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '150px' }}>
        <Checkbox checked={fromClient} onChange={() => setFromClient(!fromClient)}>
          {$t({ defaultMessage: 'From Client:' })}
        </Checkbox>
      </span>
      <Slider
        style={{
          display: fromClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0: '0.1 Mbps', 200: '200 Mbps' }}
        max={200}
        defaultValue={fromClientValue}
        onChange={(value) => setFromClientValue(value)}
      />
    </div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '150px' }}>
        <Checkbox checked={toClient} onChange={() => setToClient(!toClient)}>
          {$t({ defaultMessage: 'To Client:' })}
        </Checkbox>
      </span>
      <Slider
        style={{
          display: toClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0: '0.1 Mbps', 200: '200 Mbps' }}
        max={200}
        defaultValue={toClientValue}
        onChange={(value) => setToClientValue(value)}
      />
    </div>
  </div>

  const content = <Form layout='horizontal'>
    <Form.Item
      name='deviceOSDefaultAccess'
      label={<div style={{ textAlign: 'left' }}>
        <div>{$t({ defaultMessage: 'Default Access' })}</div>
        <span>{$t({ defaultMessage: 'Applies if no rule is matched' })}</span>
      </div>}
    >
      <div style={{ width: '100%' }}>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'deviceOS', 'defaultAccess'], 'ALLOW')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: defaultAccessStatus === 'ALLOW' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Allow' })}
          </span>
        </Button>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'deviceOS', 'defaultAccess'], 'BLOCK')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: defaultAccessStatus === 'BLOCK' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Block' })}
          </span>
        </Button>
      </div>
    </Form.Item>
    <Form.Item
      name='deviceOSRule'
      label={$t({ defaultMessage: 'Rules' }) + ` (${deviceOSRuleList.length})`}
    />
    <Table
      columns={basicColumns}
      dataSource={deviceOSRuleList as DeviceOSRule[]}
      rowKey='ruleName'
      actions={actions}
      rowActions={rowActions}
      rowSelection={{ type: 'radio' }}
    />
  </Form>

  const ruleContent = <Form layout='horizontal' form={drawerForm}>
    <Form.Item
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      initialValue={''}
      validateFirst
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (deviceOSRuleList.findIndex((rule: DeviceOSRule) => rule.ruleName === value) !== -1) {
            return Promise.reject('The rule name has already used')
          }
          return Promise.resolve()
        }
        }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='deviceOSAccess'
      label={$t({ defaultMessage: 'Action' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
    >
      <div style={{ width: '100%' }}>
        <Button
          onClick={() =>{
            form.setFieldValue(['accessControlComponent', 'deviceOS', 'access'], 'ALLOW')}
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: accessStatus === 'ALLOW' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Allow Devices' })}
          </span>
        </Button>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'deviceOS', 'access'], 'BLOCK')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: accessStatus === 'BLOCK' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Block Devices' })}
          </span>
        </Button>
      </div>
    </Form.Item>
    <Form.Item
      name='deviceType'
      label={$t({ defaultMessage: 'Device Type' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
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
        options={getDeviceTypeOptions().map((option) => ({ label: option, value: option }))}
      />}
    />
    <Form.Item
      name='osVendor'
      label={$t({ defaultMessage: 'OS Vender' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
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
        options={getOsVendorOptions(deviceType).map(option => ({ label: option, value: option }))}
      />}
    />
    <Form.Item
      name='rateLimit'
      label={$t({ defaultMessage: 'Rate Limit' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      initialValue={''}
      children={rateLimitContent}
    />
    <Form.Item
      name='vlan'
      label={$t({ defaultMessage: 'VLAN' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      initialValue={''}
      children={<Input />}
    />
  </Form>


  return (
    <>
      <span
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(true)}>
        {$t({ defaultMessage: 'Change' })}
      </span>
      <Drawer
        title={$t({ defaultMessage: 'Device & OS Access Settings' })}
        visible={visible}
        zIndex={10}
        onClose={handleDeviceOSDrawerClose}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleDeviceOSDrawerClose}
            onSave={async () => {
              try {
                form.setFieldValue(['accessControlComponent', 'deviceOS', 'ruleList'], [
                  ...deviceOSRuleList
                ])
                handleDeviceOSDrawerClose()
              } catch (error) {
                if (error instanceof Error) throw error
              }
            }}
          />
        }
        width={'830px'}
      />
      <Drawer
        title={ruleDrawerEditMode
          ? $t({ defaultMessage: 'Edit Rule' })
          : $t({ defaultMessage: 'Add Rule' })
        }
        visible={deviceOSDrawerVisible}
        zIndex={100}
        destroyOnClose={true}
        onClose={handleRuleDrawerClose}
        children={ruleContent}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleRuleDrawerClose}
            onSave={async () => {
              try {
                await drawerForm.validateFields()

                handleDeviceOSRule()
                drawerForm.resetFields()

                handleRuleDrawerClose()
              } catch (error) {
                if (error instanceof Error) throw error
              }
            }}
          />
        }
        width={'800px'}
      />
    </>
  )
}

export default DeviceOSDrawer
