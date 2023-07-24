import React, { ReactNode, useEffect, useState } from 'react'

import { Form, FormItemProps, Input, Select } from 'antd'
import _                                      from 'lodash'
import { useIntl }                            from 'react-intl'
import { useParams }                          from 'react-router-dom'

import {
  Button,
  Drawer,
  GridCol,
  GridRow,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddAppPolicyMutation,
  useAppPolicyListQuery,
  useAvcAppListQuery,
  useAvcCategoryListQuery,
  useGetAppPolicyQuery,
  useUpdateAppPolicyMutation
} from '@acx-ui/rc/services'
import {
  ApplicationAclType,
  AvcCategory,
  CommonResult,
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { PROFILE_MAX_COUNT_APPLICATION_POLICY } from '../../constants'
import { AddModeProps, editModeProps }          from '../AccessControlForm'

import {
  genRuleObject,
  transformToApplicationRule, transformToRulesForPayload,
  updateFormWithEditRow
} from './ApplicationDrawerUtils'
import ApplicationRuleContent, {
  appRateStrategyLabelMapping,
  appRateTypeLabelMapping, RateStrategyEnum,
  RateTypeEnum
} from './ApplicationRuleContent'

const { Option } = Select

const { useWatch } = Form

export interface ApplicationDrawerProps {
  inputName?: string[],
  onlyViewMode?: {
    id: string,
    viewText: string
  },
  isOnlyViewMode?: boolean,
  onlyAddMode?: AddModeProps,
  editMode?: editModeProps,
  setEditMode?: (editMode: editModeProps) => void
}

export interface ApplicationsRule {
  id?: string,
  priority: number,
  ruleName: string,
  ruleType: string,
  applications: string,
  application: string,
  accessControl: string,
  details: string,
  ruleSettings: {
    category?: string
    appCategory?: string
    appNameSystemDefined?: string
    appNameUserDefined?: string
    destinationIp?: string
    destinationPort?: number
    netmask?: string
    portMappingOnly?: boolean
    ruleType: string
    protocol?: string,
    uplink?: number,
    downlink?: number,
    markingPriority?: string,
    upLinkMarkingType?: string,
    downLinkMarkingType?: string
  }
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

const AclGridCol = ({ children }: { children: ReactNode }) => {
  return (
    <GridCol col={{ span: 6 }} style={{ marginTop: '6px' }}>
      {children}
    </GridCol>
  )
}

export const GenDetailsContent = (props: { editRow: ApplicationsRule }) => {
  const { $t } = useIntl()
  const { editRow } = props

  const detailContentType = editRow.accessControl

  switch (detailContentType) {
    case ApplicationAclType.DENY:
      return <span>{ $t({ defaultMessage: 'Block all traffic' }) }</span>
    case ApplicationAclType.RATE_LIMIT:
      let rateLimitStr: string[] = []
      if (editRow.ruleSettings.uplink) {
        rateLimitStr.push($t({ defaultMessage: 'Uplink - {value} Mbps' },
          { value: editRow.ruleSettings.uplink / 1000 }))
      }
      if (editRow.ruleSettings.downlink) {
        rateLimitStr.push($t({ defaultMessage: 'Downlink - {value} Mbps' },
          { value: editRow.ruleSettings.downlink / 1000 }))
      }
      return <span>{ rateLimitStr.join('|') }</span>
    case ApplicationAclType.QOS:
      return <span>{ $t({
        // eslint-disable-next-line max-len
        defaultMessage: 'Uplink marking: {uplinkStrategy} ({uplinkValue}) | Downlink priority: {downlinkValue}' }, {
        uplinkStrategy: editRow.ruleSettings.markingPriority ? $t(appRateTypeLabelMapping[
          editRow.ruleSettings.markingPriority as RateTypeEnum
        ]) : '',
        uplinkValue: editRow.ruleSettings.upLinkMarkingType ? $t(appRateStrategyLabelMapping[
          editRow.ruleSettings.upLinkMarkingType as RateStrategyEnum
        ]) : '',
        downlinkValue: editRow.ruleSettings.downLinkMarkingType ? $t(appRateStrategyLabelMapping[
          editRow.ruleSettings.downLinkMarkingType as RateStrategyEnum
        ]) : ''
      }) }</span>
    default:
      return <span>{ $t({ defaultMessage: 'Block all traffic' }) }</span>
  }
}

const ApplicationDrawer = (props: ApplicationDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const {
    inputName = [],
    onlyViewMode = {} as { id: string, viewText: string },
    isOnlyViewMode = false,
    onlyAddMode = { enable: false, visible: false } as AddModeProps,
    editMode = { id: '', isEdit: false } as editModeProps,
    setEditMode = () => {}
  } = props
  const [visible, setVisible] = useState(onlyAddMode.enable ? onlyAddMode.visible : false)
  const [localEditMode, setLocalEdiMode] = useState(
    { id: '', isEdit: false } as editModeProps
  )
  const form = Form.useFormInstance()
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [applicationsRuleList, setApplicationsRuleList] = useState([] as ApplicationsRule[])
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [queryPolicyName, setQueryPolicyName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [avcSelectOptions, setAvcSelectOptions] = useState([] as AvcCategory[])
  const [applicationsRule, setApplicationsRule] = useState({} as ApplicationsRule)
  const [skipFetch, setSkipFetch] = useState(true)
  const [drawerForm] = Form.useForm()
  const [contentForm] = Form.useForm()

  const [
    policyName,
    applicationPolicyId
  ] = [
    useWatch<string>('policyName', contentForm),
    useWatch<string>([...inputName, 'applicationPolicyId'])
  ]

  const [ createAppPolicy ] = useAddAppPolicyMutation()

  const [ updateAppPolicy ] = useUpdateAppPolicyMutation()

  const { appSelectOptions, appList, appIdList } = useAppPolicyListQuery({
    params: { ...params, requestId: requestId }
  }, {
    selectFromResult ({ data }) {
      return {
        appSelectOptions: data ? data.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) : [],
        appList: data ? data.map(item => item.name) : [],
        appIdList: data ? data.map(item => item.id) : []
      }
    }
  })

  const { data: appPolicyInfo } = useGetAppPolicyQuery(
    {
      params: {
        ...params,
        applicationPolicyId: isOnlyViewMode ? onlyViewMode.id : applicationPolicyId
      }
    },
    { skip: skipFetch ||
        (applicationPolicyId !== undefined
          && !appIdList.some(appId => appId === applicationPolicyId)) }
  )

  const [categoryAppMap, setCategoryAppMap] = useState({} as {
    [key: string]: { catId: number, appId: number }
  })

  const { data: avcCategoryList } = useAvcCategoryListQuery({
    params: params
  })

  const { data: avcAppList } = useAvcAppListQuery({
    params: params
  }, {
    skip: !avcCategoryList
  })

  const hasAllCategoryOption = () => {
    return avcSelectOptions &&
    avcSelectOptions.length > 0 &&
    avcSelectOptions[0].catName === 'All'
  }

  useEffect(() => {
    if (!avcCategoryList || hasAllCategoryOption()) return

    setAvcSelectOptions(
      [{
        catId: 0,
        catName: 'All',
        appNames: []
      },
      ...avcCategoryList.slice()
        .sort((a: AvcCategory, b: AvcCategory) => a.catId - b.catId)
        .map(avcCat => ({ ...avcCat, appNames: ['All'] }))
      ]
    )
  }, [avcCategoryList])

  useEffect(() => {
    if (!avcAppList) return

    avcAppList.forEach(avcApp => {
      categoryAppMap[avcApp.appName] = avcApp.avcAppAndCatId
    })
    setCategoryAppMap({ ...categoryAppMap })


    setAvcSelectOptions(avcSelectOptions => {
      avcAppList.forEach(avcApp => {
        let catId = avcSelectOptions.findIndex(option =>
          option.catId === avcApp.avcAppAndCatId.catId
        )
        if (avcSelectOptions[catId] && !avcSelectOptions[catId].appNames.includes(avcApp.appName)) {
          avcSelectOptions[catId].appNames.push(avcApp.appName)
        }
      })
      return avcSelectOptions
    })
  }, [avcAppList])

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    if (editMode.isEdit || localEditMode.isEdit) {
      return false
    }

    return !_.isNil(appPolicyInfo)
  }

  useEffect(() => {
    setSkipFetch(
      !isOnlyViewMode && (applicationPolicyId === '' || applicationPolicyId === undefined)
    )
  }, [isOnlyViewMode, applicationPolicyId])

  useEffect(() => {
    if (editMode.isEdit && editMode.id !== '') {
      setVisible(true)
      setQueryPolicyId(editMode.id)
    }
  }, [editMode])

  useEffect(() => {
    if (appPolicyInfo && (isViewMode() || editMode.isEdit || localEditMode.isEdit)) {
      contentForm.setFieldValue('policyName', appPolicyInfo.name)
      setApplicationsRuleList([...transformToApplicationRule(
        drawerForm, appPolicyInfo
      )] as ApplicationsRule[])
    }
  }, [appPolicyInfo, queryPolicyId])

  // use policyName to find corresponding id before API return profile id
  useEffect(() => {
    if (requestId && queryPolicyName) {
      appSelectOptions.map(option => {
        if (option.props.children === queryPolicyName) {
          if (!onlyAddMode.enable) {
            form.setFieldValue('applicationPolicyId', option.key)
          }
          setQueryPolicyId(option.key as string)
          setQueryPolicyName('')
          setRequestId('')
        }
      })
    }
  }, [appSelectOptions, requestId, policyName])

  useEffect(() => {
    if (onlyAddMode.enable && onlyAddMode.visible) {
      setVisible(onlyAddMode.visible)
    }
  }, [onlyAddMode])

  const basicColumns: TableProps<ApplicationsRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Rule Name' }),
      dataIndex: 'ruleName',
      key: 'ruleName',
      sorter: { compare: sortProp('ruleName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Rule Type' }),
      dataIndex: 'ruleType',
      key: 'ruleType',
      sorter: { compare: sortProp('ruleType', defaultSort) },
      render: (data, row) => {
        return _.startCase(row.ruleType)
      }
    },
    {
      title: $t({ defaultMessage: 'Application' }),
      dataIndex: 'application',
      key: 'application',
      sorter: { compare: sortProp('application', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Access Control' }),
      dataIndex: 'accessControl',
      key: 'accessControl',
      sorter: { compare: sortProp('accessControl', defaultSort) },
      render: (data, row) => {
        return _.startCase(row.accessControl)
      }
    },
    {
      title: $t({ defaultMessage: 'Details' }),
      dataIndex: 'details',
      key: 'details',
      render: (data, row) => {
        return <GenDetailsContent editRow={row} />
      }
    }
  ]

  const handleAddAction = () => {
    setRuleDrawerVisible(true)
    drawerForm.resetFields()
  }

  const clearFieldsValue = () => {
    contentForm.setFieldValue('policyName', undefined)
    setApplicationsRule({} as ApplicationsRule)
    setApplicationsRuleList([] as ApplicationsRule[])
  }

  const handleRuleDrawerClose = () => {
    setRuleDrawerVisible(false)
    setRuleDrawerEditMode(false)
    setApplicationsRule({} as ApplicationsRule)
  }

  const handleApplicationsDrawerClose = () => {
    setVisible(false)
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
  }

  const handleAddApplicationsRule = () => {
    setRuleDrawerEditMode(false)

    const ruleObject = genRuleObject(drawerForm)

    if (ruleDrawerEditMode && applicationsRule.hasOwnProperty('priority')) {
      const updateId = applicationsRuleList.findIndex(
        rule => rule.priority === applicationsRule.priority
      )
      let ruleId = {} as { id?: string }
      if (applicationsRuleList[updateId].id) {
        ruleId.id = applicationsRuleList[updateId].id
      }
      applicationsRuleList[updateId] = {
        ...ruleId,
        ...ruleObject,
        priority: updateId + 1
      }
      setApplicationsRuleList([...applicationsRuleList])
    } else {
      setApplicationsRuleList([
        ...applicationsRuleList, {
          ...ruleObject,
          priority: applicationsRuleList.length + 1
        }
      ])
    }

  }

  const actions = !isViewMode() ? [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }] : []

  const handleAppPolicy = async (edit: boolean) => {
    const transformedRules = [
      ...transformToRulesForPayload(applicationsRuleList, categoryAppMap, avcCategoryList!)
    ]

    try {
      if (!edit) {
        const appRes: CommonResult = await createAppPolicy({
          params: params,
          payload: {
            name: policyName,
            rules: transformedRules,
            description: null,
            tenantId: params.tenantId
          }
        }).unwrap()
        // let responseData = appRes.response as {
        //   [key: string]: string
        // }
        // form.setFieldValue([...inputName, 'applicationPolicyId'], responseData.id)
        // setQueryPolicyId(responseData.id)
        setRequestId(appRes.requestId)
        setQueryPolicyName(policyName)
      } else {
        await updateAppPolicy({
          params: { ...params, applicationPolicyId: queryPolicyId },
          payload: {
            id: queryPolicyId,
            name: policyName,
            rules: transformedRules,
            description: null,
            tenantId: params.tenantId
          }
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const rowActions: TableProps<ApplicationsRule>['rowActions'] = isViewMode() ? [] : [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([editRow]: ApplicationsRule[], clearSelection: () => void) => {
      setRuleDrawerVisible(true)
      setRuleDrawerEditMode(true)
      setApplicationsRule(editRow)
      updateFormWithEditRow(drawerForm, editRow)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([{ ruleName, priority }]: ApplicationsRule[], clearSelection: () => void) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: ruleName
        },
        onOk: () => {
          setApplicationsRuleList(applicationsRuleList
            .filter((rule: ApplicationsRule) => rule.priority !== priority)
            .map((rule: ApplicationsRule, ruleId: number) => {
              return {
                ...rule,
                priority: ruleId + 1
              }
            }))
          clearSelection()
        }
      })
    }
  }] as { label: string, onClick: () => void }[]

  const ruleValidator = () => {
    if (!applicationsRuleList.length) {
      return Promise.reject($t({ defaultMessage: 'No rule were added yet' }))
    }
    return Promise.resolve()
  }

  const content = <Form layout='horizontal' form={contentForm}>
    <DrawerFormItem
      name={'policyName'}
      label={$t({ defaultMessage: 'Policy Name:' })}
      rules={[
        { required: true },
        { min: 2 },
        { max: 32 },
        { validator: (_, value) => {
          if (appList && appList
            .filter(app => editMode ? (appPolicyInfo?.name !== app) : true)
            .findIndex(app => app === value) !== -1) {
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
      name='applicationsRule'
      label={$t({ defaultMessage: 'Rules ({count})' }, { count: applicationsRuleList.length })}
      rules={[
        { validator: () => ruleValidator() }
      ]}
    />
    {isOnlyViewMode && !editMode.isEdit ? <Table
      columns={basicColumns}
      dataSource={applicationsRuleList as ApplicationsRule[]}
    /> : <Table
      columns={basicColumns}
      dataSource={applicationsRuleList as ApplicationsRule[]}
      rowKey='ruleName'
      actions={filterByAccess(actions)}
      rowActions={filterByAccess(rowActions)}
      rowSelection={hasAccess() && { type: 'radio' }}
    />}
  </Form>

  const modelContent = () => {
    if (onlyAddMode.enable) {
      return null
    }

    if (isOnlyViewMode) {
      return <Button
        type='link'
        size={'small'}
        onClick={() => {
          setVisible(true)
          setQueryPolicyId(onlyViewMode.id)
        }
        }>
        {onlyViewMode.viewText}
      </Button>
    }

    return <GridRow style={{ width: '350px' }}>
      <GridCol col={{ span: 12 }}>
        <Form.Item
          name={[...inputName, 'applicationPolicyId']}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select Application profile' })
          }]}
          children={
            <Select
              style={{ width: '150px' }}
              placeholder={$t({ defaultMessage: 'Select profile...' })}
              onChange={(value) => {
                setQueryPolicyId(value)
              }}
              children={appSelectOptions}
            />
          }
        />
      </GridCol>
      <AclGridCol>
        <Button type='link'
          disabled={!applicationPolicyId}
          onClick={() => {
            if (applicationPolicyId) {
              setVisible(true)
              setQueryPolicyId(applicationPolicyId)
              setLocalEdiMode({ id: applicationPolicyId, isEdit: true })
            }
          }
          }>
          {$t({ defaultMessage: 'Edit Details' })}
        </Button>
      </AclGridCol>
      <AclGridCol>
        <Button type='link'
          disabled={appList.length >= PROFILE_MAX_COUNT_APPLICATION_POLICY}
          onClick={() => {
            setVisible(true)
            setQueryPolicyId('')
          }}>
          {$t({ defaultMessage: 'Add New' })}
        </Button>
      </AclGridCol>
    </GridRow>
  }

  return (
    <>
      {modelContent()}
      <Drawer
        title={$t({ defaultMessage: 'Application Access Settings' })}
        visible={visible}
        zIndex={10}
        onClose={() => handleApplicationsDrawerClose()
        }
        destroyOnClose={true}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            showSaveButton={!isViewMode()}
            onCancel={handleApplicationsDrawerClose}
            onSave={async () => {
              try {
                if (!isViewMode()) {
                  await contentForm.validateFields()
                  await handleAppPolicy(editMode.isEdit || localEditMode.isEdit)
                }
                handleApplicationsDrawerClose()
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
          ? $t({ defaultMessage: 'Edit Application Rule' })
          : $t({ defaultMessage: 'Add Application Rule' })
        }
        visible={ruleDrawerVisible}
        zIndex={100}
        destroyOnClose={true}
        onClose={handleRuleDrawerClose}
        children={<ApplicationRuleContent
          avcSelectOptions={avcSelectOptions}
          applicationsRuleList={applicationsRuleList}
          applicationsRule={applicationsRule}
          editMode={ruleDrawerEditMode}
          drawerForm={drawerForm}
        />}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleRuleDrawerClose}
            onSave={async () => {
              try {
                await drawerForm.validateFields()

                handleAddApplicationsRule()
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

export default ApplicationDrawer
