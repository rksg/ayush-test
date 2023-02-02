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
  showToast,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddAppPolicyMutation,
  useAppPolicyListQuery, useAvcAppListQuery, useAvcCatListQuery,
  useGetAppPolicyQuery
} from '@acx-ui/rc/services'
import {
  ApplicationAclType,
  ApplicationPortMappingType,
  ApplicationRuleType, AvcCat,
  CommonResult
} from '@acx-ui/rc/utils'

import ApplicationRuleDrawer from './ApplicationRuleDrawer'

const { Option } = Select

const { useWatch } = Form

export interface ApplicationDrawerProps {
  inputName?: string[]
}

interface ApplicationsRule {
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

const DrawerFormItem = (props: FormItemProps) => {
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

const ApplicationDrawer = (props: ApplicationDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { inputName = [] } = props
  const [visible, setVisible] = useState(false)
  const form = Form.useFormInstance()
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [applicationsRuleList, setApplicationsRuleList] = useState([] as ApplicationsRule[])
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [queryPolicyName, setQueryPolicyName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [avcSelectOptions, setAvcSelectOptions] = useState([] as AvcCat[])
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
      params: { ...params, applicationPolicyId: applicationPolicyId }
    },
    { skip: applicationPolicyId === '' || applicationPolicyId === undefined }
  )

  const [catAppMappingObject, setCatAppMappingObject] = useState({} as {
    [key: string]: { catId: number, appId: number }
  })

  const { data: avcCatList } = useAvcCatListQuery({
    params: params
  })

  const { data: avcAppList } = useAvcAppListQuery({
    params: params
  }, {
    skip: !avcCatList
  })

  useEffect(() => {
    if (avcCatList) {
      setAvcSelectOptions(
        [{
          catId: 0,
          catName: 'All',
          appNames: []
        }, ...avcCatList.slice()
          .sort((a: AvcCat, b: AvcCat) => a.catId - b.catId)
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

        if (!catAppMappingObject.hasOwnProperty(avcApp.appName)) {
          catAppMappingObject[avcApp.appName] = avcApp.avcAppAndCatId
        }
      })
      setAvcSelectOptions(
        [...avcSelectOptions]
      )
      setCatAppMappingObject({ ...catAppMappingObject })
    }
  }, [avcCatList, avcAppList])


  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    return !_.isNil(appPolicyInfo)
  }

  useEffect(() => {
    if (isViewMode() && appPolicyInfo) {
      contentForm.setFieldValue('policyName', appPolicyInfo.name)
      setApplicationsRuleList([...appPolicyInfo.rules.map(rule => {
        let systemDefined = {} as { [key: string]: string | number }
        let userDefined = {} as { [key: string]: string | number }
        if (rule.ruleType === ApplicationRuleType.SIGNATURE) {
          systemDefined.appNameSystemDefined = `${rule.category}_${rule.applicationName}`
          systemDefined.category = rule.category
        }
        if (rule.ruleType === ApplicationRuleType.USER_DEFINED) {
          userDefined.appNameUserDefined = rule.applicationName

          if (rule.portMapping === ApplicationPortMappingType.IP_WITH_PORT
            && rule.destinationPort
            && rule.destinationIp
            && rule.protocol
            && rule.netmask) {
            userDefined.destinationPort = rule.destinationPort
            userDefined.destinationIp = rule.destinationIp
            userDefined.netmask = rule.netmask
            userDefined.protocol = rule.protocol
          }
        }
        return {
          priority: rule.priority,
          id: rule.id,
          ruleName: rule.name,
          ruleType: rule.ruleType,
          applications: rule.applicationName,
          accessControl: rule.accessControl,
          details: genDetailsContent(rule.accessControl),
          ruleSettings: {
            ...systemDefined,
            ...userDefined,
            ruleType: rule.ruleType
          }
        }
      })] as ApplicationsRule[])
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
      key: 'details'
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
  }

  const genDetailsContent = (sourceValue: string) => {
    switch (sourceValue) {
      case ApplicationAclType.DENY:
        return $t({ defaultMessage: 'Block all traffic' })
      case ApplicationAclType.RATE_LIMIT:
        let rateLimitStr: string[] = []
        if (drawerForm.getFieldValue(['uplink'])) {
          rateLimitStr.push($t({ defaultMessage: 'Uplink - {value} Mbps' },
            { value: drawerForm.getFieldValue(['uplink']) }))
        }
        if (drawerForm.getFieldValue(['downlink'])) {
          rateLimitStr.push($t({ defaultMessage: 'Downlink - {value} Mbps' },
            { value: drawerForm.getFieldValue(['downlink']) }))
        }
        return rateLimitStr.join('|')
      case ApplicationAclType.QOS:
        return $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Uplink marking: {uplinkStrategy} ({uplinkValue}) | Downlink priority: {downlinkValue}' }, {
          uplinkStrategy: drawerForm.getFieldValue(['uplinkMarking', 'strategy']),
          uplinkValue: drawerForm.getFieldValue(['uplinkMarking', 'value']),
          downlinkValue: drawerForm.getFieldValue(['downlinkPriority', 'value'])
        })
      default:
        return $t({ defaultMessage: 'Block all traffic' })
    }
  }

  const handleApplicationsRule = () => {
    setRuleDrawerEditMode(false)

    const ruleObject = {
      ruleName: drawerForm.getFieldValue('ruleName') ?? '',
      ruleType: drawerForm.getFieldValue('ruleType'),
      applications: '-',
      accessControl: drawerForm.getFieldValue('accessControl'),
      details: genDetailsContent(drawerForm.getFieldValue('accessControl')),
      ruleSettings: {
        ruleType: drawerForm.getFieldValue('ruleType'),
        appCategory: drawerForm.getFieldValue('applicationCategory'),
        appNameSystemDefined: drawerForm.getFieldValue('applicationNameSystemDefined'),
        appNameUserDefined: drawerForm.getFieldValue('applicationNameUserDefined'),
        portMappingOnly: drawerForm.getFieldValue('portMappingOnly'),
        destinationIp: drawerForm.getFieldValue('destinationIp'),
        netmask: drawerForm.getFieldValue('netmask'),
        destinationPort: drawerForm.getFieldValue('destinationPort'),
        protocol: drawerForm.getFieldValue('protocol'),
        uplink: drawerForm.getFieldValue('uplink'),
        downlink: drawerForm.getFieldValue('downlink')
      }
    }

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
            rules: [...applicationsRuleList.map(rule => {
              let catAppConfig = {} as {
                applicationId: number, applicationName: string, category: string, categoryId: number
              }
              if (rule.ruleType === ApplicationRuleType.SIGNATURE
                && rule.ruleSettings.appNameSystemDefined
                && rule.ruleSettings.appCategory
              ) {
                const [catName, appName] = rule.ruleSettings.appNameSystemDefined.split('_')
                const catAppMapping = catAppMappingObject[appName]
                catAppConfig.applicationId = catAppMapping.appId
                catAppConfig.applicationName = appName
                catAppConfig.categoryId = catAppMapping.catId
                catAppConfig.category = catName
              }

              let userAppConfig = {} as {
                portMapping?: string, destinationIp?: string, netmask?: string,
                destinationPort: number, protocol: string, applicationName: string
              }
              if (rule.ruleSettings.appNameUserDefined
                && rule.ruleSettings.destinationPort
                && rule.ruleSettings.protocol) {
                userAppConfig.applicationName = rule.ruleSettings.appNameUserDefined
                userAppConfig.portMapping = rule.ruleSettings.portMappingOnly
                  ? ApplicationPortMappingType.PORT_ONLY
                  : ApplicationPortMappingType.IP_WITH_PORT
                if (!rule.ruleSettings.portMappingOnly) {
                  userAppConfig.destinationIp = rule.ruleSettings.destinationIp
                  userAppConfig.netmask = rule.ruleSettings.netmask
                }
                userAppConfig.destinationPort = rule.ruleSettings.destinationPort
              }

              return {
                ...catAppConfig,
                ...userAppConfig,
                accessControl: rule.accessControl.toUpperCase(),
                name: rule.ruleName,
                priority: rule.priority,
                ruleType: rule.ruleType
              }
            })],
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
    } catch(error) {
      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const rowActions: TableProps<ApplicationsRule>['rowActions'] = isViewMode() ? [] : [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([editRow]: ApplicationsRule[], clearSelection: () => void) => {
      setRuleDrawerVisible(true)
      setRuleDrawerEditMode(true)
      setApplicationsRule(editRow)
      drawerForm.setFieldValue('ruleName', editRow.ruleName)
      drawerForm.setFieldValue('ruleType', editRow.ruleType)
      drawerForm.setFieldValue('accessControl', editRow.accessControl)
      drawerForm.setFieldValue('applicationCategory', editRow.ruleSettings.appCategory)
      // eslint-disable-next-line max-len
      drawerForm.setFieldValue('applicationNameSystemDefined', editRow.ruleSettings.appNameSystemDefined)
      // eslint-disable-next-line max-len
      drawerForm.setFieldValue('applicationNameUserDefined', editRow.ruleSettings.appNameUserDefined)
      drawerForm.setFieldValue('portMappingOnly', editRow.ruleSettings.portMappingOnly)
      drawerForm.setFieldValue('destinationIp', editRow.ruleSettings.destinationIp)
      drawerForm.setFieldValue('netmask', editRow.ruleSettings.netmask)
      drawerForm.setFieldValue('destinationPort', editRow.ruleSettings.destinationPort)
      drawerForm.setFieldValue('protocol', editRow.ruleSettings.protocol)
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
        { required: true,
          validator: (_, value) => {
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
      actions={actions}
      rowActions={rowActions}
      rowSelection={{ type: 'radio' }}
    />
  </Form>

  return (
    <>
      <GridRow style={{ width: '350px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            name={[...inputName, 'applicationPolicyId']}
            rules={[{
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
      </GridRow>
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
            onCancel={handleApplicationsDrawerClose}
            onSave={async () => {
              try {
                await contentForm.validateFields()
                if (!isViewMode()) {
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
        children={<ApplicationRuleDrawer
          avcSelectOptions={avcSelectOptions}
          drawerForm={drawerForm}
        />}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleRuleDrawerClose}
            onSave={async () => {
              try {
                await drawerForm.validateFields()

                handleApplicationsRule()
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
