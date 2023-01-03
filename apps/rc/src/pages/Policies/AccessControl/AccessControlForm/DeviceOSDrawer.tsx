import React, { useEffect, useState } from 'react'

import { Checkbox, Col, Form, FormItemProps, Input, Row, Select, Slider } from 'antd'
import _                                                                  from 'lodash'
import { useIntl }                                                        from 'react-intl'
import styled, { css }                                                    from 'styled-components/macro'

import {
  ContentSwitcher,
  ContentSwitcherProps,
  Drawer,
  showActionModal, showToast,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddDevicePolicyMutation,
  useDevicePolicyListQuery, useGetDevicePolicyQuery
} from '@acx-ui/rc/services'
import { AccessStatus, CommonResult, DeviceRule } from '@acx-ui/rc/utils'
import { useParams }                              from '@acx-ui/react-router-dom'

const { Option } = Select

const { useWatch } = Form

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

const deviceTypeOptionList = getDeviceTypeOptions().map((option) =>
  <Option key={option}>{option}</Option>
)

const ViewDetailsWrapper = styled.span<{ $policyId: string }>`
  ${props => props.$policyId
    ? css`cursor: pointer;`
    : css`cursor: not-allowed; color: darkgray;`}
`

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

const DrawerFormItem = (props: FormItemProps) => {
  return (
    <Form.Item
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      style={{ marginBottom: '5px' }}
      {...props} />
  )
}

export interface DeviceOSDrawerProps {
  inputName?: string[]
}

const DeviceOSDrawer = (props: DeviceOSDrawerProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const params = useParams()
  const { inputName = [] } = props
  const form = Form.useFormInstance()
  const [deviceOSDrawerVisible, setDeviceOSDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [deviceOSRuleList, setDeviceOSRuleList] = useState([] as DeviceOSRule[]
  )
  const [deviceType, setDeviceType] = useState('' as DeviceTypeEnum)
  const [osVendor, setOsVendor] = useState(
    $t({ defaultMessage: 'Please select...' }) as OsVendorEnum
  )
  const [osVendorOptionList, setOsVendorOptionList] = useState([] as JSX.Element[])
  const [deviceOSRule, setDeviceOSRule] = useState({} as DeviceOSRule)
  const [fromClient, setFromClient] = useState(false)
  const [fromClientValue, setFromClientValue] = useState(0)
  const [toClient, setToClient] = useState(false)
  const [toClientValue, setToClientValue] = useState(0)
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [requestId, setRequestId] = useState('')
  const [contentForm] = Form.useForm()
  const [drawerForm] = Form.useForm()

  const [
    accessStatus,
    policyName,
    devicePolicyId
  ] = [
    useWatch<string>('access', contentForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>([...inputName, 'devicePolicyId'])
  ]

  const [ createDevicePolicy ] = useAddDevicePolicyMutation()

  const { deviceSelectOptions, deviceList } = useDevicePolicyListQuery({
    params: { ...params, requestId: requestId },
    payload: {
      fields: ['name', 'id'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  }, {
    selectFromResult ({ data }) {
      return {
        deviceSelectOptions: data?.data?.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) ?? [],
        deviceList: data?.data?.map(item => item.name)
      }
    }
  })

  const { data: devicePolicyInfo } = useGetDevicePolicyQuery(
    {
      params: { ...params, devicePolicyId: devicePolicyId }
    },
    { skip: devicePolicyId === '' || devicePolicyId === undefined }
  )

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    return !_.isNil(devicePolicyInfo)
  }

  useEffect(() => {
    if (isViewMode() && devicePolicyInfo) {
      contentForm.setFieldValue('policyName', devicePolicyInfo.name)
      contentForm.setFieldValue('deviceDefaultAccess', devicePolicyInfo.defaultAccess)
      setDeviceOSRuleList([...devicePolicyInfo.rules.map((deviceRule: DeviceRule) => ({
        ruleName: deviceRule.name,
        osVendor: deviceRule.osVendor,
        deviceType: deviceRule.deviceType,
        access: deviceRule.action,
        details: {
          vlan: deviceRule.vlan,
          upLink: deviceRule.uploadRateLimit,
          downLink: deviceRule.downloadRateLimit
        }
      }))] as DeviceOSRule[])
    }
  }, [devicePolicyInfo, queryPolicyId])

  useEffect(() => {
    setOsVendorOptionList(
      getOsVendorOptions(deviceType).map(option =>
        <Option key={option}>{option}</Option>
      )
    )
  }, [deviceType])

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

  const EmptyElement = (props: { access: AccessStatus }) => {
    drawerForm.setFieldValue('layer3DefaultAccess', props.access)
    return <></>
  }

  const DefaultEmptyElement = (props: { access: AccessStatus }) => {
    contentForm.setFieldValue('layer3DefaultAccess', props.access)
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

  const defaultTabDetails:ContentSwitcherProps['tabDetails']=[
    {
      label: $t({ defaultMessage: 'Allow Traffic' }),
      children: <DefaultEmptyElement access={AccessStatus.ALLOW} />,
      value: AccessStatus.ALLOW,
      disabled: isViewMode()
    },
    {
      label: $t({ defaultMessage: 'Block Traffic' }),
      children: <DefaultEmptyElement access={AccessStatus.BLOCK} />,
      value: AccessStatus.BLOCK,
      disabled: isViewMode()
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

  const clearFieldsValue = () => {
    contentForm.setFieldValue('policyName', undefined)
    contentForm.setFieldValue('deviceDefaultAccess', undefined)
    setDeviceOSRuleList([])
  }

  const handleDeviceOSDrawerClose = () => {
    setVisible(false)
    setQueryPolicyId('')
    clearFieldsValue()
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

  const actions = !isViewMode() ? [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }] : []

  const handleDevicePolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        const deviceRes: CommonResult = await createDevicePolicy({
          params: params,
          payload: {
            name: policyName,
            defaultAccess: accessStatus,
            rules: [...deviceOSRuleList.map(rule => {
              return {
                name: rule.ruleName,
                action: rule.access,
                deviceType: rule.deviceType,
                osVendor: rule.osVendor,
                uploadRateLimit: rule.details.upLink >= 0 ? rule.details.upLink : null,
                downloadRateLimit: rule.details.downLink >= 0 ? rule.details.downLink : null,
                vlan: rule.details.vlan
              }
            })],
            description: null
          }
        }).unwrap()
        // let responseData = deviceRes.response as {
        //   [key: string]: string
        // }
        // form.setFieldValue([...inputName, 'l3AclPolicyId'], responseData.id)
        // setQueryPolicyId(responseData.id)
        setRequestId(deviceRes.requestId)
      }
    } catch(error) {
      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const rowActions: TableProps<DeviceOSRule>['actions'] = isViewMode() ? [] : [{
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

  const content = <Form layout='horizontal' form={contentForm}>
    <DrawerFormItem
      name={'policyName'}
      label={$t({ defaultMessage: 'Policy Name:' })}
      rules={[
        { required: true,
          validator: (_, value) => {
            if (deviceList && deviceList.find(device => device === value)) {
              return Promise.reject($t({
                defaultMessage: 'A policy with that name already exists'
              }))
            }
            return Promise.resolve()}
        }
      ]}
      children={<Input disabled={isViewMode()}/>}
    />
    <DrawerFormItem
      name='deviceDefaultAccess'
      label={<div style={{ textAlign: 'left' }}>
        <div>{$t({ defaultMessage: 'Default Access' })}</div>
        <span style={{ fontSize: '10px' }}>
          {$t({ defaultMessage: 'Applies if no rule is matched' })}
        </span>
      </div>}
      children={<ContentSwitcher tabDetails={defaultTabDetails} size='large' />}
    />
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
    <DrawerFormItem
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      initialValue={''}
      validateFirst
      rules={[
        { required: true },
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
        children={deviceTypeOptionList}
      />}
    />
    <DrawerFormItem
      name='osVendor'
      label={$t({ defaultMessage: 'OS Vender' })}
      initialValue={osVendor}
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
        children={osVendorOptionList}
      />}
    />
    <DrawerFormItem
      name='rateLimit'
      label={$t({ defaultMessage: 'Rate Limit' })}
      initialValue={''}
      children={rateLimitContent}
    />
    <DrawerFormItem
      name='vlan'
      label={$t({ defaultMessage: 'VLAN' })}
      initialValue={''}
      children={<Input />}
    />
  </Form>

  return (
    <>
      <Row justify={'space-between'} style={{ width: '300px' }}>
        <Col span={12} style={{ textAlign: 'center' }}>
          <Form.Item
            name={[...inputName, 'devicePolicyId']}
            rules={[{
              message: $t({ defaultMessage: 'Please select Device & OS profile' })
            }]}
            children={
              <Select
                placeholder={$t({ defaultMessage: 'Select profile...' })}
                onChange={(value) => {
                  setQueryPolicyId(value)
                }}
                children={deviceSelectOptions}
              />
            }
          />
        </Col>
        <Col span={6} style={{ textAlign: 'center' }}>
          <ViewDetailsWrapper $policyId={devicePolicyId}
            onClick={() => {
              if (devicePolicyId) {
                setVisible(true)
                setQueryPolicyId(devicePolicyId)
              }
            }}>
            {$t({ defaultMessage: 'View Details' })}
          </ViewDetailsWrapper>
        </Col>
        <Col span={5} style={{ textAlign: 'center' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setVisible(true)
              setQueryPolicyId('')
              clearFieldsValue()
            }}>
            {$t({ defaultMessage: 'Add New' })}
          </span>
        </Col>
      </Row>
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
                await contentForm.validateFields()
                if (!isViewMode()) {
                  await handleDevicePolicy(false)
                }
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
