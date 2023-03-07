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
  useAppPolicyListQuery, useAvcAppListQuery, useAvcCategoryListQuery,
  useGetAppPolicyQuery
} from '@acx-ui/rc/services'
import {
  ApplicationAclType,
  ApplicationRuleType, AvcCategory,
  CommonResult
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

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

export interface editModeProps {
  id: string,
  isEdit: boolean
}

const { useWatch } = Form

export interface ApplicationDrawerProps {
  inputName?: string[],
  onlyViewMode?: {
    id: string,
    viewText: string
  },
  isOnlyViewMode?: boolean,
  editMode?: editModeProps,
  setEditMode?: (editMode: editModeProps) => void
}

export interface ApplicationsRule {
  id?: string,
  priority: number,
  ruleName: string,
  ruleType: string,
  applications: string,
  accessControl: string,
  details: string,
  ruleSettings: {
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
        uplinkStrategy: editRow.ruleSettings.markingPriority ? $t(appRateStrategyLabelMapping[
          editRow.ruleSettings.markingPriority as RateStrategyEnum
        ]) : '',
        uplinkValue: editRow.ruleSettings.upLinkMarkingType ? $t(appRateTypeLabelMapping[
          editRow.ruleSettings.upLinkMarkingType as RateTypeEnum
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
    editMode = { id: '', isEdit: false } as editModeProps,
    setEditMode = () => {}
  } = props
  const [visible, setVisible] = useState(false)
  const form = Form.useFormInstance()
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [applicationsRuleList, setApplicationsRuleList] = useState([] as ApplicationsRule[])
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [queryPolicyName, setQueryPolicyName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [avcSelectOptions, setAvcSelectOptions] = useState([] as AvcCategory[])
  const [applicationsRule, setApplicationsRule] = useState({} as ApplicationsRule)
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

  const { appSelectOptions, appList } = useAppPolicyListQuery({
    params: { ...params, requestId: requestId },
    payload: {
      fields: ['name', 'id'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  }, {
    selectFromResult ({ data }) {
      return {
        appSelectOptions: data?.data?.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) ?? [],
        appList: data?.data?.map(item => item.name)
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
    { skip: !isOnlyViewMode && (applicationPolicyId === '' || applicationPolicyId === undefined) }
  )

  const [categoryAppMappingObject, setCategoryAppMappingObject] = useState({} as {
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

  useEffect(() => {
    if (avcCategoryList) {
      setAvcSelectOptions(
        [{
          catId: 0,
          catName: 'All',
          appNames: []
        }, ...avcCategoryList.slice()
          .sort((a: AvcCategory, b: AvcCategory) => a.catId - b.catId)
          .map(avcCat => {
            return {
              ...avcCat,
              appNames: []
            }
          })
        ]
      )
    }

    if (avcAppList) {
      avcAppList.map(avcApp => {
        let catId = avcSelectOptions.findIndex(option =>
          option.catId === avcApp.avcAppAndCatId.catId
        )
        if (avcSelectOptions[catId]) {
          avcSelectOptions[catId].appNames.push(avcApp.appName)
        }

        if (!categoryAppMappingObject.hasOwnProperty(avcApp.appName)) {
          categoryAppMappingObject[avcApp.appName] = avcApp.avcAppAndCatId
        }
      })
      setAvcSelectOptions(
        [...avcSelectOptions]
      )
      setCategoryAppMappingObject({ ...categoryAppMappingObject })
    }
  }, [avcCategoryList, avcAppList])

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    if (editMode) {
      return !editMode.isEdit
    }

    return !_.isNil(appPolicyInfo)
  }

  useEffect(() => {
    if (editMode.isEdit && editMode.id !== '') {
      setVisible(true)
      setQueryPolicyId(editMode.id)
    }
  }, [editMode])

  useEffect(() => {
    if (appPolicyInfo) {
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
          form.setFieldValue('applicationPolicyId', option.key)
          setQueryPolicyId(option.key as string)
          setQueryPolicyName('')
          setRequestId('')
        }
      })
    }
  }, [appSelectOptions, requestId, policyName])


  const basicColumns: TableProps<ApplicationsRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Rule Name' }),
      dataIndex: 'ruleName',
      key: 'ruleName'
    },
    {
      title: $t({ defaultMessage: 'Rule Type' }),
      dataIndex: 'ruleType',
      key: 'ruleType',
      render: (data, row) => {
        return _.startCase(row.ruleType)
      }
    },
    {
      title: $t({ defaultMessage: 'Application' }),
      dataIndex: 'application',
      key: 'application',
      render: (data, row) => {
        if (row.ruleSettings.ruleType === ApplicationRuleType.USER_DEFINED) {
          return row.ruleSettings.appNameUserDefined
        }
        return row.ruleSettings?.appNameSystemDefined?.replace('_', ' > ')
      }
    },
    {
      title: $t({ defaultMessage: 'Access Control' }),
      dataIndex: 'accessControl',
      key: 'accessControl',
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
  }

  const handleAddApplicationsRule = () => {
    setRuleDrawerEditMode(false)

    const ruleObject = genRuleObject(drawerForm)

    if (ruleDrawerEditMode && applicationsRule.hasOwnProperty('priority')) {
      const updateId = applicationsRuleList.findIndex(
        rule => rule.priority === applicationsRule.priority
      )
      applicationsRuleList[updateId] = {
        ...ruleObject,
        priority: updateId
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
    try {
      if (!edit) {
        const appRes: CommonResult = await createAppPolicy({
          params: params,
          payload: {
            name: policyName,
            rules: [...transformToRulesForPayload(applicationsRuleList, categoryAppMappingObject)],
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

  const content = <Form layout='horizontal' form={contentForm}>
    <DrawerFormItem
      name={'policyName'}
      label={$t({ defaultMessage: 'Policy Name:' })}
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (appList && appList.find(app => app === value)) {
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
    />
    <Table
      columns={basicColumns}
      dataSource={applicationsRuleList as ApplicationsRule[]}
      rowKey='ruleName'
      actions={filterByAccess(actions)}
      rowActions={filterByAccess(rowActions)}
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
      </Button> : <GridRow style={{ width: '350px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            name={[...inputName, 'applicationPolicyId']}
            rules={[{
              required: true
            }, {
              message: $t({ defaultMessage: 'Please select Application profile' })
            }]}
            children={
              <Select
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
            }}>
            {$t({ defaultMessage: 'Add New' })}
          </Button>
        </AclGridCol>
      </GridRow> }
      <Drawer
        title={$t({ defaultMessage: 'Application Access Settings' })}
        visible={visible}
        zIndex={10}
        onClose={handleApplicationsDrawerClose}
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
                  await handleAppPolicy(false)
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
