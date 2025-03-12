import React, { ReactNode, useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import TextArea                from 'antd/lib/input/TextArea'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import {
  Button,
  ContentSwitcher,
  ContentSwitcherProps,
  Drawer,
  GridCol,
  GridRow,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useAddDevicePolicyMutation,
  useAddDevicePolicyTemplateMutation,
  useGetDevicePolicyQuery,
  useGetDevicePolicyTemplateListQuery,
  useGetDevicePolicyTemplateQuery,
  useGetEnhancedDeviceProfileListQuery,
  useUpdateDevicePolicyMutation,
  useUpdateDevicePolicyTemplateMutation
} from '@acx-ui/rc/services'
import {
  AccessStatus,
  CommonResult,
  defaultSort,
  DevicePolicy,
  DeviceRule,
  OsVendorEnum,
  PolicyOperation,
  PolicyType,
  sortProp,
  TableResult,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  useTemplateAwarePolicyPermission
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { AddModeProps, editModeProps }                            from '../AccessControlForm'
import { PROFILE_MAX_COUNT_DEVICE_POLICY, QUERY_DEFAULT_PAYLOAD } from '../constants'
import { useScrollLock }                                          from '../ScrollLock'

import DeviceOSRuleContent, { DrawerFormItem } from './DeviceOSRuleContent'

const { Option } = Select

const { useWatch } = Form

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
  drawerViewModeId?: string,
  onlyAddMode?: AddModeProps,
  editMode?: editModeProps,
  setEditMode?: (editMode: editModeProps) => void,
  callBack?: () => void
}

export const GenDetailsColumn = (props: { row: DeviceOSRule }) => {
  const { $t } = useIntl()
  const { row } = props

  if (row.access === AccessStatus.BLOCK) {
    return <div>
      {$t({ defaultMessage: 'All Traffic is blocked' })}
    </div>
  }

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

export const DeviceOSDrawer = (props: DeviceOSDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const {
    inputName = [],
    onlyViewMode = {} as { id: string, viewText: string },
    isOnlyViewMode = false,
    onlyAddMode = { enable: false, visible: false } as AddModeProps,
    drawerViewModeId = '',
    editMode = { id: '', isEdit: false } as editModeProps,
    setEditMode = () => {},
    callBack = () => {}
  } = props
  const [visible, setVisible] = useState(onlyAddMode.enable ? onlyAddMode.visible : false)
  const [localEditMode, setLocalEdiMode] = useState(
    { id: '', isEdit: false } as editModeProps
  )
  const form = Form.useFormInstance()
  const [deviceOSDrawerVisible, setDeviceOSDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [deviceOSRuleList, setDeviceOSRuleList] = useState([] as DeviceOSRule[])
  const [deviceOSRule, setDeviceOSRule] = useState({} as DeviceOSRule)
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [queryPolicyName, setQueryPolicyName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [skipFetch, setSkipFetch] = useState(true)
  const [contentForm] = Form.useForm()
  const [drawerForm] = Form.useForm()

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : enableRbac

  const { lockScroll, unlockScroll } = useScrollLock()

  const [
    accessStatus,
    policyName,
    description,
    devicePolicyId
  ] = [
    useWatch<string>('deviceDefaultAccess', contentForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>('description', contentForm),
    useWatch<string>([...inputName, 'devicePolicyId'])
  ]

  const isNewOsVendorFeatureEnabled = useIsSplitOn(Features.NEW_OS_VENDOR_IN_DEVICE_POLICY)

  const isAP70Allowed = useIsTierAllowed(TierFeatures.AP_70)

  const [ createDevicePolicy ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddDevicePolicyMutation,
    useTemplateMutationFn: useAddDevicePolicyTemplateMutation
  })

  const [ updateDevicePolicy ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateDevicePolicyMutation,
    useTemplateMutationFn: useUpdateDevicePolicyTemplateMutation
  })

  const { deviceSelectOptions, deviceList } = useGetDeviceAclPolicyListInstance(
    editMode.isEdit, resolvedRbacEnabled
  )

  const { data: devicePolicyInfo } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetDevicePolicyQuery,
    useTemplateQueryFn: useGetDevicePolicyTemplateQuery,
    skip: skipFetch,
    extraParams: { devicePolicyId: isOnlyViewMode ? onlyViewMode.id : devicePolicyId },
    enableRbac: resolvedRbacEnabled
  })

  const setDrawerVisible = (status: boolean) => {
    if (status) {
      lockScroll()
    } else {
      unlockScroll()
    }
    setVisible(status)
  }

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    if (drawerViewModeId !== '') {
      return !_.isNil(devicePolicyInfo)
    }

    if (editMode.isEdit || localEditMode.isEdit) {
      return false
    }

    return !_.isNil(devicePolicyInfo)
  }

  useEffect(() => {
    setSkipFetch(!isOnlyViewMode && !devicePolicyId)
  }, [isOnlyViewMode, devicePolicyId])

  useEffect(() => {
    if (drawerViewModeId !== '') {
      setDrawerVisible(true)
      setQueryPolicyId(drawerViewModeId)
    }
  }, [drawerViewModeId])

  useEffect(() => {
    if (editMode.isEdit && editMode.id !== '') {
      setDrawerVisible(true)
      setQueryPolicyId(editMode.id)
    }
  }, [editMode])

  useEffect(() => {
    if (contentForm && devicePolicyInfo &&
      (isViewMode() || editMode.isEdit || localEditMode.isEdit)) {
      contentForm.setFieldValue('policyName', devicePolicyInfo.name)
      contentForm.setFieldValue('description', devicePolicyInfo.description)
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
  }, [contentForm, devicePolicyInfo, queryPolicyId])

  useEffect(() => {
    if (onlyAddMode.enable && onlyAddMode.visible) {
      setDrawerVisible(onlyAddMode.visible)
    }
  }, [onlyAddMode])

  // use policyName to find corresponding id before API return profile id
  useEffect(() => {
    if (form && requestId && queryPolicyName) {
      deviceSelectOptions.forEach(option => {
        if (option.props.children === queryPolicyName) {
          if (!onlyAddMode.enable) {
            form.setFieldValue([...inputName, 'devicePolicyId'], option.key)
          }
          setQueryPolicyId(option.key as string)
          setQueryPolicyName('')
          setRequestId('')
        }
      })
    }
  }, [form, deviceSelectOptions, requestId, policyName])

  const basicColumns: TableProps<DeviceOSRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Rule Name' }),
      dataIndex: 'ruleName',
      key: 'ruleName',
      sorter: { compare: sortProp('ruleName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceType',
      key: 'deviceType',
      sorter: { compare: sortProp('deviceType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'OS' }),
      dataIndex: 'osVendor',
      key: 'osVendor',
      sorter: { compare: sortProp('osVendor', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Access' }),
      dataIndex: 'access',
      key: 'access',
      sorter: { compare: sortProp('access', defaultSort) },
      render: (_, row) => {
        return row.access
      }
    },
    {
      title: $t({ defaultMessage: 'Details' }),
      dataIndex: 'details',
      key: 'details',
      render: (_, row) => {
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
    contentForm.setFieldValue('description', undefined)
    contentForm.setFieldValue('deviceDefaultAccess', undefined)
    setDeviceOSRuleList([])
  }

  const handleDeviceOSDrawerClose = () => {
    setDrawerVisible(false)
    setQueryPolicyId('')
    clearFieldsValue()
    if (editMode.isEdit) {
      setEditMode({
        id: '', isEdit: false
      })
    }
    if (localEditMode.isEdit) {
      setLocalEdiMode({
        id: '', isEdit: false
      })
    }
    callBack()
  }


  const handleEditDetailsInfo = (rule: DeviceOSRule) => {
    drawerForm.setFieldValue('access', rule.access)
    if (rule.access !== AccessStatus.BLOCK) {
      drawerForm.setFieldValue('details', rule.details)
      drawerForm.setFieldValue('vlan', rule.details.vlan)
      if (rule.details.upLink && rule.details.upLink !== -1) {
        drawerForm.setFieldValue('fromClient', true)
        drawerForm.setFieldValue('fromClientValue', rule.details.upLink)
      }
      if (rule.details.downLink && rule.details.downLink !== -1) {
        drawerForm.setFieldValue('toClient', true)
        drawerForm.setFieldValue('toClientValue', rule.details.downLink)
      }
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

  const maxOSRuleNum = (isNewOsVendorFeatureEnabled && isAP70Allowed) ?
    (32 -
      deviceOSRuleList.filter((rule) => rule.osVendor === OsVendorEnum.Xbox).length -
      deviceOSRuleList.filter((rule) => rule.osVendor === OsVendorEnum.PlayStation).length) : 32

  const actions = !isViewMode() ? [{
    label: $t({ defaultMessage: 'Add' }),
    disabled: deviceOSRuleList.length >= maxOSRuleNum,
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
          uploadRateLimit: rule.access !== AccessStatus.BLOCK && rule.details.upLink >= 0
            ? rule.details.upLink : null,
          downloadRateLimit: rule.access !== AccessStatus.BLOCK && rule.details.downLink >= 0
            ? rule.details.downLink : null,
          vlan: rule.access !== AccessStatus.BLOCK ? rule.details.vlan : null
        }
      })],
      description: description
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
          payload: convertToPayload(),
          enableRbac: resolvedRbacEnabled
        }).unwrap()
        setRequestId(deviceRes.requestId)
        setQueryPolicyName(policyName)
      } else {
        await updateDevicePolicy({
          params: { ...params, devicePolicyId: queryPolicyId },
          payload: convertToPayload(queryPolicyId),
          enableRbac: resolvedRbacEnabled
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
      drawerForm.setFieldValue('tempOsVendor', editRow.osVendor)
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

  const ruleValidator = () => {
    if (!deviceOSRuleList.length) {
      return Promise.reject($t({ defaultMessage: 'No rule were added yet' }))
    }
    return Promise.resolve()
  }

  const content = <>
    <Form layout='horizontal' form={contentForm}>
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
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        rules={[
          { max: 180 }
        ]}
        children={<TextArea disabled={isViewMode()} />}
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
        rules={[
          { validator: () => ruleValidator() }
        ]}
        children={<></>}
      />
      {isOnlyViewMode && !editMode.isEdit ? <Table
        columns={basicColumns}
        dataSource={deviceOSRuleList as DeviceOSRule[]}
      /> : <Table
        columns={basicColumns}
        dataSource={deviceOSRuleList as DeviceOSRule[]}
        rowKey='ruleName'
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'radio' }}
      />}
    </Form>
    <Drawer
      title={ruleDrawerEditMode
        ? $t({ defaultMessage: 'Edit Rule' })
        : $t({ defaultMessage: 'Add Rule' })
      }
      visible={deviceOSDrawerVisible}
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

  const hasCreatePermission = useTemplateAwarePolicyPermission(
    PolicyType.DEVICE_POLICY, PolicyOperation.CREATE
  )

  const hasEditPermission = useTemplateAwarePolicyPermission(
    PolicyType.DEVICE_POLICY, PolicyOperation.EDIT
  )

  const modelContent = () => {
    if (onlyAddMode.enable || drawerViewModeId !== '') {
      return null
    }

    if (isOnlyViewMode) {
      return <Button
        type='link'
        size={'small'}
        onClick={() => {
          setDrawerVisible(true)
          setQueryPolicyId(onlyViewMode.id)
        }
        }>
        {onlyViewMode.viewText}
      </Button>
    }

    return <GridRow style={{ width: '350px' }}>
      <GridCol col={{ span: 12 }}>
        <Form.Item
          name={[...inputName, 'devicePolicyId']}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select Device & OS profile' })
          }]}
          children={
            <Select
              style={{ width: '150px' }}
              placeholder={$t({ defaultMessage: 'Select profile...' })}
              disabled={visible}
              onChange={(value) => {
                setQueryPolicyId(value)
              }}
              children={deviceSelectOptions}
            />
          }
        />
      </GridCol>
      <AclGridCol>
        {hasEditPermission &&
          <Button type='link'
            disabled={visible || !devicePolicyId}
            onClick={() => {
              if (devicePolicyId) {
                setDrawerVisible(true)
                setQueryPolicyId(devicePolicyId)
                setLocalEdiMode({ id: devicePolicyId, isEdit: true })
              }
            }
            }>
            {$t({ defaultMessage: 'Edit Details' })}
          </Button>
        }
      </AclGridCol>
      <AclGridCol>
        {hasCreatePermission &&
          <Button type='link'
            disabled={visible || deviceList.length >= PROFILE_MAX_COUNT_DEVICE_POLICY}
            onClick={() => {
              setDrawerVisible(true)
              setQueryPolicyId('')
              clearFieldsValue()
            }}>
            {$t({ defaultMessage: 'Add New' })}
          </Button>
        }
      </AclGridCol>
    </GridRow>
  }

  return (
    <>
      {modelContent()}
      <Drawer
        title={$t({ defaultMessage: 'Device & OS Access Settings' })}
        visible={visible}
        onClose={() => handleDeviceOSDrawerClose()}
        children={content}
        push={false}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            showSaveButton={!isViewMode()}
            onCancel={handleDeviceOSDrawerClose}
            onSave={async () => {
              try {
                if (!isViewMode()) {
                  await contentForm.validateFields()
                  await handleDevicePolicy(editMode.isEdit || localEditMode.isEdit)
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
    </>
  )
}

const useGetDeviceAclPolicyListInstance = (isEdit: boolean, enableRbac: boolean): {
  deviceSelectOptions: JSX.Element[], deviceList: string[]
} => {
  const { data } = useConfigTemplateQueryFnSwitcher<TableResult<DevicePolicy>>({
    useQueryFn: useGetEnhancedDeviceProfileListQuery,
    useTemplateQueryFn: useGetDevicePolicyTemplateListQuery,
    skip: isEdit,
    payload: QUERY_DEFAULT_PAYLOAD,
    enableRbac: enableRbac
  })

  return {
    deviceSelectOptions: data?.data?.map(
      item => {
        return <Option key={item.id}>{item.name}</Option>
      }) ?? [],
    deviceList: data?.data?.map(item => item.name) ?? []
  }
}
