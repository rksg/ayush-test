import React, { ReactNode, useEffect, useState } from 'react'

import { Checkbox, Form, FormItemProps, Input, Radio, RadioChangeEvent, Select, Slider } from 'antd'
import _                                                                                 from 'lodash'
import { useIntl }                                                                       from 'react-intl'
import { useParams }                                                                     from 'react-router-dom'

import {
  Button,
  ContentSwitcher,
  ContentSwitcherProps,
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
  useAppPolicyListQuery,
  useAvcAppListQuery,
  useAvcCatListQuery,
  useGetAppPolicyQuery
} from '@acx-ui/rc/services'
import {
  ApplicationAclType,
  ApplicationPortMappingType,
  ApplicationRuleType,
  AvcCat,
  CommonResult,
  serverIpAddressRegExp,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'

import { AppAclLabelMapping, AppRuleLabelMapping } from '../../contentsMap'

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
    protocol?: string
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
  const [applicationsRule, setApplicationsRule] = useState({} as ApplicationsRule)
  const [avcSelectOptions, setAvcSelectOptions] = useState([] as AvcCat[])
  const [category, setCategory] = useState('')
  const [sourceValue, setSourceValue] = useState('')
  const [maxUplinkRate, setMaxUplinkRate] = useState({ status: false, value: 0 })
  const [maxDownlinkRate, setMaxDownlinkRate] = useState({ status: false, value: 0 })
  const [drawerForm] = Form.useForm()
  const [contentForm] = Form.useForm()

  const [catAppMappingObject, setCatAppMappingObject] = useState({} as {
    [key: string]: { catId: number, appId: number }
  })

  const [
    ruleType,
    portMappingOnly,
    policyName,
    applicationPolicyId
  ] = [
    useWatch<string>(['ruleType'], drawerForm),
    useWatch<string>(['portMappingOnly'], drawerForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>([...inputName, 'applicationPolicyId'])
  ]

  const { data: avcCatList } = useAvcCatListQuery({
    params: params
  })

  const { data: avcAppList } = useAvcAppListQuery({
    params: params
  }, {
    skip: !avcCatList
  })

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

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    return !_.isNil(appPolicyInfo)
  }

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

  const onSourceChange = (e: RadioChangeEvent) => {
    setSourceValue(e.target.value)
  }

  const genDetailsContent = (sourceValue: string) => {
    switch (sourceValue) {
      case ApplicationAclType.DENY:
        return $t({ defaultMessage: 'Block all traffic' })
      case ApplicationAclType.RATE_LIMIT:
        let rateLimitStr = []
        if (maxUplinkRate.status) {
          rateLimitStr.push($t({ defaultMessage: 'Uplink - {value} Mbps' },
            { value: maxUplinkRate.value }))
        }
        if (maxDownlinkRate.status) {
          rateLimitStr.push($t({ defaultMessage: 'Downlink - {value} Mbps' },
            { value: maxDownlinkRate.value }))
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
        protocol: drawerForm.getFieldValue('protocol')
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

  const rowActions: TableProps<ApplicationsRule>['actions'] = isViewMode() ? [] : [{
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

  const selectCategory = (
    <Select
      style={{ width: '100%' }}
      onChange={(evt) => {
        setCategory(evt)
        drawerForm.setFieldValue('applicationNameSystemDefined', 'Select Application...')
      }}
    >
      {avcSelectOptions.map(avcCat => {
        return <Option key={`${avcCat.catName}_${avcCat.catId}`} value={avcCat.catName}>
          {avcCat.catName}
        </Option>
      })}
    </Select>
  )

  const selectApplication = (category: string) => {
    if (category === 'All') {
      let optionsList = [] as string[]
      Object.entries(avcSelectOptions).map(entry => {
        const [category, appList] = entry
        if (Number(category) !== 0) {
          optionsList.push(...appList.appNames.map((appName) => {
            return `${avcSelectOptions[Number(category)].catName}_${appName}`
          }))
        }
      })
      return <Select
        style={{ width: '100%' }}
      >
        {optionsList.map(option => {
          return <Option key={option} value={option}>
            {option.split('_')[1]}
          </Option>
        })}
      </Select>
    }
    const categoryId = avcSelectOptions
      .findIndex(cat => cat.catName === category)

    return <Select
      style={{ width: '100%' }}
    >
      {avcSelectOptions[categoryId]?.appNames.map((avcApp: string) => {
        return <Option key={`${category}_${avcApp}`} value={`${category}_${avcApp}`}>
          {avcApp}
        </Option>
      })}
    </Select>
  }

  const EmptyElement = (props: { ruleType: string }) => {
    drawerForm.setFieldValue('ruleType', props.ruleType)
    return <></>
  }

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    {
      label: $t(AppRuleLabelMapping[ApplicationRuleType.SIGNATURE]),
      children: <EmptyElement ruleType={ApplicationRuleType.SIGNATURE} />,
      value: ApplicationRuleType.SIGNATURE
    },
    {
      label: $t(AppRuleLabelMapping[ApplicationRuleType.USER_DEFINED]),
      children: <EmptyElement ruleType={ApplicationRuleType.USER_DEFINED} />,
      value: ApplicationRuleType.USER_DEFINED
    }
  ]

  const rateLimitContent = <div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '200px' }}>
        <Checkbox
          checked={maxUplinkRate.status}
          onChange={() => setMaxUplinkRate({
            ...maxUplinkRate,
            status: !maxUplinkRate.status
          })}
        >
          {$t({ defaultMessage: 'Max uplink rate:' })}
        </Checkbox>
      </span>
      { maxUplinkRate.status && <Slider
        style={{
          // display: fromClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0.25: '0.25 Mbps', 20: '20 Mbps' }}
        max={20}
        defaultValue={0.25}
        onChange={(value) => setMaxUplinkRate({
          ...maxUplinkRate,
          value: value
        })}
      /> }
    </div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '200px' }}>
        <Checkbox
          checked={maxDownlinkRate.status}
          onChange={() => setMaxDownlinkRate({
            ...maxDownlinkRate,
            status: !maxDownlinkRate.status
          })}
        >
          {$t({ defaultMessage: 'Max downlink rate:' })}
        </Checkbox>
      </span>
      { maxDownlinkRate.status && <Slider
        style={{
          // display: toClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0.25: '0.25 Mbps', 20: '20 Mbps' }}
        max={20}
        defaultValue={0.25}
        onChange={(value) => setMaxDownlinkRate({
          ...maxDownlinkRate,
          value: value
        })}
      /> }
    </div>
  </div>

  const RATE_TYPE = [
    $t({ defaultMessage: '802.1p' }),
    $t({ defaultMessage: 'DSCP' }),
    $t({ defaultMessage: 'Both' })
  ]

  const RATE_STRATEGY = [
    $t({ defaultMessage: 'Voice' }),
    $t({ defaultMessage: 'Video' }),
    $t({ defaultMessage: 'Best effort' }),
    $t({ defaultMessage: 'Background' })
  ]

  const PROTOCOL_TYPE = [
    $t({ defaultMessage: 'TCP' }),
    $t({ defaultMessage: 'UDP' })
  ]

  const maxUplinkRateContent = <GridRow>
    <GridCol col={{ span: 12 }}>
      <Form.Item
        name={['uplinkMarking', 'value']}
        style={{ width: '100%' }}
        wrapperCol={{ span: 24 }}
        initialValue={RATE_TYPE[0]}
        children={<Select
          defaultValue={RATE_TYPE[0]}
          onChange={(value) => drawerForm.setFieldValue(['uplinkMarking', 'value'], value)}
          options={RATE_TYPE.map(rateType =>
            ({ label: rateType, value: rateType }))} />}
      />
    </GridCol>
    <GridCol col={{ span: 12 }}>
      <Form.Item
        name={['uplinkMarking', 'strategy']}
        style={{ width: '100%' }}
        wrapperCol={{ span: 24 }}
        initialValue={RATE_STRATEGY[3]}
        children={<Select
          defaultValue={RATE_STRATEGY[3]}
          onChange={(value) => drawerForm.setFieldValue(['uplinkMarking', 'strategy'], value)}
          options={RATE_STRATEGY.map(rateStrategy =>
            ({ label: rateStrategy, value: rateStrategy }))} />}
      />
    </GridCol>
  </GridRow>

  const maxDownlinkRateContent = <GridRow>
    <GridCol col={{ span: 24 }}>
      <Form.Item
        name={['downlinkPriority', 'value']}
        style={{ width: '100%' }}
        wrapperCol={{ span: 24 }}
        initialValue={RATE_STRATEGY[0]}
        children={<Select
          defaultValue={RATE_STRATEGY[0]}
          onChange={(value) => drawerForm.setFieldValue(['downlinkPriority', 'value'], value)}
          options={RATE_STRATEGY.map(rateStrategy =>
            ({ label: rateStrategy, value: rateStrategy }))} />}
      />
    </GridCol>
  </GridRow>

  const qosContent = <>
    <DrawerFormItem
      name='uplinkMarking'
      style={{ width: '100%' }}
      wrapperCol={{ span: 24 }}
      label={$t({ defaultMessage: 'Uplink Marking' })}
    >
      {maxUplinkRateContent}
    </DrawerFormItem>
    <DrawerFormItem
      name='downlinkPriority'
      style={{ width: '100%' }}
      wrapperCol={{ span: 24 }}
      label={$t({ defaultMessage: 'Downlink Priority' })}
    >
      {maxDownlinkRateContent}
    </DrawerFormItem>
  </>

  const accessControlField = <Radio.Group
    onChange={onSourceChange}
    value={sourceValue}
    style={{ width: '100%', marginBottom: '10px' }}
  >
    <GridRow >
      <GridCol col={{ span: 24 }}>
        <Radio value={ApplicationAclType.DENY}>
          {$t(AppAclLabelMapping[ApplicationAclType.DENY])}
        </Radio>
      </GridCol>

      <GridCol col={{ span: 24 }}>
        <Radio value={ApplicationAclType.RATE_LIMIT}>
          {$t(AppAclLabelMapping[ApplicationAclType.RATE_LIMIT])}
        </Radio>
      </GridCol>
      <GridCol col={{ span: 24 }}>
        {sourceValue === ApplicationAclType.RATE_LIMIT
          ? <div style={{ display: 'flex' }}>
            <Form.Item
              style={{ width: '100%' }}
              name='rateLimitFields'
              rules={[
                { validator: () => {
                  if (!maxUplinkRate.status && !maxDownlinkRate.status) {
                    return Promise.reject($t({
                      defaultMessage: 'Must have a least one enabled rate limiting'
                    }))
                  }
                  return Promise.resolve()
                } }
              ]}
            >
              {rateLimitContent}
            </Form.Item>
          </div> : null}
      </GridCol>

      <GridCol col={{ span: 24 }}>
        <Radio value={ApplicationAclType.QOS}>
          {$t(AppAclLabelMapping[ApplicationAclType.QOS])}
        </Radio>
      </GridCol>
      <GridCol col={{ span: 24 }}>
        {sourceValue === ApplicationAclType.QOS ? qosContent : null}
      </GridCol>
    </GridRow>

  </Radio.Group>

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

  const ruleContent = <Form layout='horizontal' form={drawerForm}>
    <DrawerFormItem
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      initialValue={''}
      validateFirst
      rules={[
        { required: true },
        { max: 64 }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a short description, up to 64 characters' })}
      />}
    />
    <DrawerFormItem
      name='ruleType'
      label={$t({ defaultMessage: 'Rule Type' })}
      initialValue={drawerForm.getFieldValue('ruleType')}
      rules={[
        { required: true }
      ]}
      children={
        <ContentSwitcher
          tabDetails={tabDetails}
          defaultValue={drawerForm.getFieldValue('ruleType')}
          size='small'
        />
      }
    />
    {/* systemDefined option */}
    { ruleType === ApplicationRuleType.SIGNATURE && <DrawerFormItem
      name='applicationCategory'
      label={$t({ defaultMessage: 'Application Category' })}
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (value === 'Select Category...') {
            return Promise.reject($t({ defaultMessage: 'Please select the category' }))
          }
          return Promise.resolve()
        } }
      ]}
      initialValue={$t({ defaultMessage: 'Select Category...' })}
      children={selectCategory}
    /> }
    { ruleType === ApplicationRuleType.SIGNATURE && <DrawerFormItem
      name='applicationNameSystemDefined'
      label={$t({ defaultMessage: 'Application Name' })}
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (value === 'Select Application...') {
            return Promise.reject($t({ defaultMessage: 'Please select the application' }))
          }
          return Promise.resolve()
        } }
      ]}
      initialValue={$t({ defaultMessage: 'Select Application...' })}
      children={selectApplication(category)}
    /> }
    {/* userDefined option */}
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='applicationNameUserDefined'
      label={$t({ defaultMessage: 'Application Name' })}
      initialValue={''}
      rules={[
        { required: true }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter the application name' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='portMappingOnly'
      label={' '}
      colon={false}
      initialValue={false}
      valuePropName='checked'
      children={<Checkbox>{$t({ defaultMessage: 'Port Mapping Only' })}</Checkbox>}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && !portMappingOnly && <DrawerFormItem
      name='destinationIp'
      label={$t({ defaultMessage: 'Destination Ip' })}
      initialValue={''}
      rules={[
        { required: true },
        { validator: (_, value) => serverIpAddressRegExp(value) }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a destination Ip' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && !portMappingOnly && <DrawerFormItem
      name='netmask'
      label={$t({ defaultMessage: 'Netmask' })}
      initialValue={''}
      rules={[
        { required: true },
        { validator: (_, value) => subnetMaskIpRegExp(value) }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a mask' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='destinationPort'
      label={$t({ defaultMessage: 'Destination Port' })}
      initialValue={''}
      rules={[
        { required: true },
        { max: 64 }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a port number' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='protocol'
      label={$t({ defaultMessage: 'Protocol' })}
      initialValue={PROTOCOL_TYPE[0]}
      rules={[
        { required: true }
      ]}
      children={<Select
        defaultValue={PROTOCOL_TYPE[0]}
        onChange={(value) => drawerForm.setFieldValue('protocol', value)}
        options={PROTOCOL_TYPE.map(protocol =>
          ({ label: protocol, value: protocol }))} />}
    /> }
    <DrawerFormItem
      name='accessControl'
      label={$t({ defaultMessage: 'Access Control' })}
      initialValue={sourceValue}
      rules={[
        { required: true }
      ]}
      children={accessControlField}
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
        children={ruleContent}
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
