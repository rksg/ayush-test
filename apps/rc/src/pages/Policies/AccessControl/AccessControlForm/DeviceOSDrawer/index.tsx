import React, { ReactNode, useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import {
  Button,
  ContentSwitcher,
  ContentSwitcherProps,
  Drawer, GridCol, GridRow,
  showActionModal, showToast,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddDevicePolicyMutation,
  useDevicePolicyListQuery,
  useGetDevicePolicyQuery,
  useUpdateDevicePolicyMutation
} from '@acx-ui/rc/services'
import { AccessStatus, CommonResult, DeviceRule } from '@acx-ui/rc/utils'
import { useParams }                              from '@acx-ui/react-router-dom'

import DeviceOSRuleContent, { DrawerFormItem } from './DeviceOSRuleContent'

const { Option } = Select

const { useWatch } = Form

export interface editModeProps {
  id: string,
  isEdit: boolean
}

export interface DeviceOSRule {
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

export interface DeviceOSDrawerProps {
  inputName?: string[],
  onlyViewMode?: {
    id: string,
    viewText: string
  },
  isOnlyViewMode?: boolean,
  editMode?: editModeProps,
  setEditMode?: (editMode: editModeProps) => void
}

export const GenDetailsColumn = (props: { row: DeviceOSRule }) => {
  const { $t } = useIntl()
  const { row } = props

  const linkArray = []
  if (row.details.upLink >= 0) {
    linkArray.push($t({ defaultMessage: 'Uplink - {upLink} Mbps' }, {
      upLink: row.details.upLink
    }))
  }
  if (row.details.downLink >= 0) {
    linkArray.push($t({ defaultMessage: 'DownLink - {downLink} Mbps' }, {
      downLink: row.details.downLink
    }))
  }
  return <div style={{ display: 'flex', flexDirection: 'column' }}>
    {row.details.vlan && <span>{$t({ defaultMessage: 'VLAN: {vlan}' }, {
      vlan: row.details.vlan
    })}</span>}
    <span style={{ whiteSpace: 'nowrap' }}>
      {linkArray.length ? $t({ defaultMessage: 'Rate Limit: ' }) : ''} {linkArray.join(' | ')}
    </span>
  </div>
}

const AclGridCol = ({ children }: { children: ReactNode }) => {
  return (
    <GridCol col={{ span: 6 }} style={{ marginTop: '6px' }}>
      {children}
    </GridCol>
  )
}

const DeviceOSDrawer = (props: DeviceOSDrawerProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const params = useParams()
  const {
    inputName = [],
    onlyViewMode = {} as { id: string, viewText: string },
    isOnlyViewMode = false,
    editMode = { id: '', isEdit: false } as editModeProps,
    setEditMode = () => {}
  } = props
  const [deviceOSDrawerVisible, setDeviceOSDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [deviceOSRuleList, setDeviceOSRuleList] = useState([] as DeviceOSRule[])
  const [deviceOSRule, setDeviceOSRule] = useState({} as DeviceOSRule)
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [requestId, setRequestId] = useState('')
  const [contentForm] = Form.useForm()
  const [drawerForm] = Form.useForm()

  const [
    accessStatus,
    policyName,
    devicePolicyId
  ] = [
    useWatch<string>('deviceDefaultAccess', contentForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>([...inputName, 'devicePolicyId'])
  ]

  const [ createDevicePolicy ] = useAddDevicePolicyMutation()

  const [ updateDevicePolicy ] = useUpdateDevicePolicyMutation()

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
      params: { ...params, devicePolicyId: isOnlyViewMode ? onlyViewMode.id : devicePolicyId }
    },
    { skip: !isOnlyViewMode && (devicePolicyId === '' || devicePolicyId === undefined) }
  )

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    if (editMode) {
      return !editMode.isEdit
    }

    return !_.isNil(devicePolicyInfo)
  }

  useEffect(() => {
    if (editMode.isEdit && editMode.id !== '') {
      setVisible(true)
      setQueryPolicyId(editMode.id)
    }
  }, [editMode])

  useEffect(() => {
    if (devicePolicyInfo) {
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
        return <GenDetailsColumn row={row} />
      }
    }
  ]


  const DefaultEmptyElement = (props: { access: AccessStatus }) => {
    contentForm.setFieldValue('deviceOSDefaultAccess', props.access)
    return <></>
  }

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
    if (editMode.isEdit) {
      setEditMode({
        id: '', isEdit: false
      })
    }
  }


  const handleEditDetailsInfo = (rule: DeviceOSRule) => {
    drawerForm.setFieldValue('details', rule.details)
    drawerForm.setFieldValue('vlan', rule.details.vlan)
    if (rule.details.upLink !== -1) {
      drawerForm.setFieldValue('fromClient', true)
      drawerForm.setFieldValue('fromClientValue', rule.details.upLink)
    }
    if (rule.details.downLink !== -1) {
      drawerForm.setFieldValue('toClient', true)
      drawerForm.setFieldValue('toClientValue', rule.details.downLink)
    }
  }

  const handleDeviceOSRule = () => {
    setRuleDrawerEditMode(false)

    const ruleObject = {
      ruleName: drawerForm.getFieldValue('ruleName'),
      access: drawerForm.getFieldValue('access'),
      deviceType: drawerForm.getFieldValue('deviceType'),
      osVendor: drawerForm.getFieldValue('osVendor'),
      details: {
        vlan: drawerForm.getFieldValue('vlan') ?? '',
        upLink: drawerForm.getFieldValue('fromClient')
          ? drawerForm.getFieldValue('fromClientValue')
          : -1,
        downLink: drawerForm.getFieldValue('toClient')
          ? drawerForm.getFieldValue('toClientValue')
          : -1
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

  const convertToPayload = (policyId?: string) => {
    let id = {}
    if (policyId) {
      id = { id: policyId }
    }
    let payload = {
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

    return {
      ...id,
      ...payload
    }
  }

  const handleDevicePolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        const deviceRes: CommonResult = await createDevicePolicy({
          params: params,
          payload: convertToPayload()
        }).unwrap()
        // let responseData = deviceRes.response as {
        //   [key: string]: string
        // }
        // form.setFieldValue([...inputName, 'l3AclPolicyId'], responseData.id)
        // setQueryPolicyId(responseData.id)
        setRequestId(deviceRes.requestId)
      } else {
        await updateDevicePolicy({
          params: { ...params, devicePolicyId: queryPolicyId },
          payload: convertToPayload(queryPolicyId)
        }).unwrap()
      }
    } catch(error) {
      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const rowActions: TableProps<DeviceOSRule>['rowActions'] = isViewMode() ? [] : [{
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

  const content = <Form layout='horizontal' form={contentForm}>
    <DrawerFormItem
      name={'policyName'}
      label={$t({ defaultMessage: 'Policy Name:' })}
      rules={[
        { required: true },
        { min: 2 },
        { max: 32 },
        { validator: (_, value) => {
          if (deviceList && deviceList
            .filter(device => editMode ? (devicePolicyInfo?.name !== device) : true)
            .findIndex(device => device === value) !== -1) {
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
      label={$t({ defaultMessage: 'Rules ({number})' }, {
        number: deviceOSRuleList.length
      })}
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

  return (
    <>
      { isOnlyViewMode ? <Button
        type='link'
        size={'small'}
        onClick={() => {
          setVisible(true)
          setQueryPolicyId(onlyViewMode.id)
        }
        }>
        {onlyViewMode.viewText}
      </Button>: <GridRow style={{ width: '350px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            name={[...inputName, 'devicePolicyId']}
            rules={[{
              required: true
            }, {
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
        </GridCol>
        <AclGridCol>
          <Button type='link'
            disabled={!devicePolicyId}
            onClick={() => {
              if (devicePolicyId) {
                setVisible(true)
                setQueryPolicyId(devicePolicyId)
              }
            }
            }>
            {$t({ defaultMessage: 'View Details' })}
          </Button>
        </AclGridCol>
        <AclGridCol>
          <Button type='link'
            onClick={() => {
              setVisible(true)
              setQueryPolicyId('')
              clearFieldsValue()
            }}>
            {$t({ defaultMessage: 'Add New' })}
          </Button>
        </AclGridCol>
      </GridRow> }
      <Drawer
        title={$t({ defaultMessage: 'Device & OS Access Settings' })}
        visible={visible}
        zIndex={10}
        onClose={handleDeviceOSDrawerClose}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            showSaveButton={!isViewMode()}
            onCancel={handleDeviceOSDrawerClose}
            onSave={async () => {
              try {
                if (!isViewMode()) {
                  await contentForm.validateFields()
                  await handleDevicePolicy(editMode.isEdit)
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
        children={<DeviceOSRuleContent
          drawerForm={drawerForm}
          deviceOSRuleList={deviceOSRuleList}
          ruleDrawerEditMode={ruleDrawerEditMode}
        />}
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
