import React, { ReactNode, useEffect, useRef, useState } from 'react'

import { Form, Input, Radio, RadioChangeEvent, Select } from 'antd'
import TextArea                                         from 'antd/lib/input/TextArea'
import _                                                from 'lodash'
import { DndProvider, useDrag, useDrop }                from 'react-dnd'
import { HTML5Backend }                                 from 'react-dnd-html5-backend'
import { useIntl }                                      from 'react-intl'
import { useParams }                                    from 'react-router-dom'
import styled                                           from 'styled-components/macro'

import {
  Button,
  ContentSwitcher,
  ContentSwitcherProps,
  Drawer,
  Fieldset,
  GridCol,
  GridRow,
  Loader,
  PageHeader,
  StepsForm,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { Drag }                          from '@acx-ui/icons'
import {
  useAddL3AclPolicyMutation,
  useAddL3AclPolicyTemplateMutation,
  useGetEnhancedL3AclProfileListQuery,
  useGetL3AclPolicyQuery,
  useGetL3AclPolicyTemplateListQuery,
  useGetL3AclPolicyTemplateQuery,
  useUpdateL3AclPolicyMutation,
  useUpdateL3AclPolicyTemplateMutation
} from '@acx-ui/rc/services'
import {
  AccessStatus,
  CommonResult,
  L3AclPolicy,
  layer3ProtocolLabelMapping,
  Layer3ProtocolType,
  networkWifiIpRegExp,
  networkWifiDualModeIpRegExp,
  dualModeSubnetMaskIpRegExp,
  customizePromiseAny,
  PolicyOperation,
  PolicyType,
  portRegExp,
  subnetMaskIpRegExp,
  ipv6RegExp,
  ipv6PrefixRegExp,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher, usePoliciesBreadcrumb, usePolicyPageHeaderTitle,
  useTemplateAwarePolicyPermission
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { TableResult }               from '@acx-ui/utils'


import { AddModeProps, editModeProps }                                                  from './AccessControlForm'
import { DEFAULT_LAYER3_RULES, PROFILE_MAX_COUNT_LAYER3_POLICY, QUERY_DEFAULT_PAYLOAD } from './constants'
import PolicyFormItem                                                                   from './PolicyFormItem'
import { useScrollLock }                                                                from './ScrollLock'

const { useWatch } = Form
const { Option } = Select

interface Layer3ComponentProps {
  inputName?: string[],
  onlyViewMode?: {
    id: string,
    viewText: string
  },
  isOnlyViewMode?: boolean,
  isComponentMode?: boolean,
  drawerViewModeId?: string,
  onlyAddMode?: AddModeProps,
  editMode?: editModeProps,
  setEditMode?: (editMode: editModeProps) => void,
  callBack?: () => void
}

interface Layer3NetworkCol {
  type: string,
  subnet?: string,
  ipMask?: string,
  ip?: string,
  port: string,
  enableIpSubnet?: boolean
}

interface Layer3Rule {
  id?: string,
  priority: number,
  description: string,
  access: string,
  protocol: string,
  source: Layer3NetworkCol,
  destination: Layer3NetworkCol
}

enum RuleSourceType {
  ANY = 'Any',
  SUBNET = 'Subnet',
  IP = 'Ip'
}

const FormItemsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  > * {
    width: 48%
  }
`

type DragItemProps = {
  id: number
}

const AclGridCol = ({ children }: { children: ReactNode }) => {
  return (
    <GridCol col={{ span: 6 }} style={{ marginTop: '6px' }}>
      {children}
    </GridCol>
  )
}

export const Layer3Component = (props: Layer3ComponentProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const {
    inputName = [],
    onlyViewMode = {} as { id: string, viewText: string },
    isComponentMode = false,
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
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [layer3RuleList, setLayer3RuleList] = useState(DEFAULT_LAYER3_RULES as Layer3Rule[])
  const [layer3Rule, setLayer3Rule] = useState({} as Layer3Rule)
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [queryPolicyName, setQueryPolicyName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [sourceValue, setSourceValue] = useState(1)
  const [destValue, setDestValue] = useState(1)
  const [skipFetch, setSkipFetch] = useState(true)
  const [contentForm] = Form.useForm()
  const [drawerForm] = Form.useForm()
  const [policyId, setPolicyId] = useState<string | null>(null)

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isApIpModeFFEnabled = useIsSplitOn(Features.WIFI_EDA_IP_MODE_CONFIG_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : enableRbac

  const breadcrumb = usePoliciesBreadcrumb()
  const pageTitle = usePolicyPageHeaderTitle(editMode.isEdit, PolicyType.LAYER_3_POLICY)

  const { lockScroll, unlockScroll } = useScrollLock()

  const AnyText = $t({ defaultMessage: 'Any' })
  const RuleSource =[RuleSourceType.ANY, RuleSourceType.SUBNET, RuleSourceType.IP]

  const [
    accessStatus,
    policyName,
    description,
    l3AclPolicyId
  ] = [
    useWatch<string>('layer3DefaultAccess', contentForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>('description', contentForm),
    useWatch<string>([...inputName, 'l3AclPolicyId'])
  ]

  const [ createL3AclPolicy ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddL3AclPolicyMutation,
    useTemplateMutationFn: useAddL3AclPolicyTemplateMutation
  })

  const [ updateL3AclPolicy ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateL3AclPolicyMutation,
    useTemplateMutationFn: useUpdateL3AclPolicyTemplateMutation
  })

  const notForQueryList = (onlyAddMode.enable || drawerViewModeId !== '' || isOnlyViewMode)

  const { layer3SelectOptions, layer3List } = useGetL3AclPolicyListInstance(
    editMode.isEdit, resolvedRbacEnabled, notForQueryList
  )

  useEffect(() => {
    if (isOnlyViewMode) {
      setPolicyId(onlyViewMode.id)
    }
    if (isComponentMode) {
      setPolicyId(params.policyId || null)
    }
  }, [isComponentMode, params, isOnlyViewMode, onlyViewMode.id])

  const { data: layer3PolicyInfo } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetL3AclPolicyQuery,
    useTemplateQueryFn: useGetL3AclPolicyTemplateQuery,
    skip: !isComponentMode && (!visible || skipFetch),
    extraParams: { l3AclPolicyId: policyId || l3AclPolicyId },
    enableRbac: resolvedRbacEnabled
  })

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    if (drawerViewModeId !== '') {
      return !_.isNil(layer3PolicyInfo)
    }

    if (editMode.isEdit || localEditMode.isEdit) {
      return false
    }

    return !_.isNil(layer3PolicyInfo)
  }

  const setDrawerVisible = (status: boolean) => {
    if (status) {
      lockScroll()
    } else {
      unlockScroll()
    }
    setVisible(status)
  }

  useEffect(() => {
    setSkipFetch(!isOnlyViewMode && !l3AclPolicyId)
  }, [isOnlyViewMode, l3AclPolicyId, drawerViewModeId])

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
    if (contentForm && layer3PolicyInfo &&
      (isViewMode() || editMode.isEdit || localEditMode.isEdit)) {
      contentForm.setFieldValue('policyName', layer3PolicyInfo.name)
      contentForm.setFieldValue('description', layer3PolicyInfo.description)
      contentForm.setFieldValue('layer3DefaultAccess', layer3PolicyInfo.defaultAccess)
      setLayer3RuleList([...layer3PolicyInfo.l3Rules.map(l3Rule => {
        return {
          access: l3Rule.access,
          description: l3Rule.description,
          priority: l3Rule.priority,
          protocol: l3Rule.protocol as Layer3ProtocolType ?? Layer3ProtocolType.ANYPROTOCOL,
          source: { ...l3Rule.source },
          destination: { ...l3Rule.destination }
        }
      }).sort((a, b) => a.priority - b.priority)] as Layer3Rule[])
    }
  }, [contentForm, layer3PolicyInfo, queryPolicyId])

  // use policyName to find corresponding id before API return profile id
  useEffect(() => {
    if (form && requestId && queryPolicyName) {
      layer3SelectOptions.forEach(option => {
        if (option.props.children === queryPolicyName) {
          if (!onlyAddMode.enable) {
            form.setFieldValue([...inputName, 'l3AclPolicyId'], option.key)
          }
          setQueryPolicyId(option.key as string)
          setQueryPolicyName('')
          setRequestId('')
        }
      })
    }
  }, [form, layer3SelectOptions, requestId, policyName])

  useEffect(() => {
    if (onlyAddMode.enable && onlyAddMode.visible) {
      setDrawerVisible(onlyAddMode.visible)
    }
  }, [onlyAddMode])

  const basicColumns: TableProps<Layer3Rule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Priority' }),
      dataIndex: 'priority',
      key: 'priority'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: $t({ defaultMessage: 'Access' }),
      dataIndex: 'access',
      key: 'access'
    },
    {
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'source',
      key: 'source',
      render: (_, row) => {
        return <NetworkColumnComponent network={row.source} row={row} />
      }
    },
    {
      title: $t({ defaultMessage: 'Destination' }),
      dataIndex: 'destination',
      key: 'destination',
      render: (_, row) => {
        return <NetworkColumnComponent network={row.destination} row={row} />
      }
    },
    {
      title: $t({ defaultMessage: 'Protocol' }),
      dataIndex: 'protocol',
      key: 'protocol',
      render: (_, row) => {
        const protocol = row.protocol ?? Layer3ProtocolType.ANYPROTOCOL
        return $t(layer3ProtocolLabelMapping[protocol as keyof typeof Layer3ProtocolType])
      }
    },
    {
      dataIndex: 'sort',
      key: 'sort',
      fixed: 'right',
      width: 45,
      render: (_, row) => {
        return <div data-testid={`${row.priority}_Icon`} style={{ textAlign: 'center' }}>
          <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
        </div>
      }
    }
  ]

  const NetworkColumnComponent = (props: { network: Layer3NetworkCol, row: Layer3Rule }) => {
    const { network, row } = props
    const { protocol } = row

    let ipString = RuleSourceType.ANY as string
    if (network.type === RuleSourceType.SUBNET) {
      ipString = `${network.subnet}/${network.ipMask}`
    }
    if (network.type === RuleSourceType.IP) {
      ipString = `${network.ip}`
    }
    if (network.ipMask) {
      ipString = `${network.ip}/${network.ipMask}`
    } else if (network.ip) {
      ipString = `${network.ip}`
    }

    let portString = network.port === '' || network.port === undefined
      ? AnyText
      : network.port

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span>{$t({ defaultMessage: 'IP: {ipString}' }, { ipString: ipString })}</span>
      { (protocol !== Layer3ProtocolType.L3ProtocolEnum_ICMP_ICMPV4) && <span>
        {$t({ defaultMessage: 'Port: {portString}' }, { portString: portString })}
      </span> }
    </div>
  }

  const onSourceChange = (e: RadioChangeEvent) => {
    setSourceValue(e.target.value)
    drawerForm.setFieldValue('sourceType', RuleSource[e.target.value - 1])
  }

  const onDestChange = (e: RadioChangeEvent) => {
    setDestValue(e.target.value)
    drawerForm.setFieldValue('destType', RuleSource[e.target.value - 1])
  }

  const handleAddAction = () => {
    setRuleDrawerVisible(true)
    drawerForm.resetFields()
  }

  const handleRuleDrawerClose = () => {
    setRuleDrawerVisible(false)
    setRuleDrawerEditMode(false)
    setLayer3Rule({} as Layer3Rule)
  }

  const clearFieldsValue = () => {
    contentForm.setFieldValue('policyName', undefined)
    contentForm.setFieldValue('description', undefined)
    contentForm.setFieldValue('layer3DefaultAccess', undefined)
    setLayer3RuleList(DEFAULT_LAYER3_RULES)
  }

  const handleContentClose = () => {
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
    if (!isComponentMode) {
      setDrawerVisible(false)
    }
    callBack()
  }

  const handleContentFinish = async () => {
    try {
      await contentForm.validateFields()
      if (!isViewMode()) {
        await handleL3AclPolicy(editMode.isEdit || localEditMode.isEdit)
      }
      handleContentClose()
    } catch (error) {
      if (error instanceof Error) throw error
    }
  }

  const handleLayer3Rule = () => {
    setRuleDrawerEditMode(false)

    let sourceIpSettings = {} as { subnet: string, ipMask: string, ip: string }
    if (drawerForm.getFieldValue('sourceType') !== AnyText) {
      sourceIpSettings = {
        subnet: drawerForm.getFieldValue('sourceNetworkAddress') ?? '',
        ipMask: drawerForm.getFieldValue('sourceMask') ?? '',
        ip: drawerForm.getFieldValue('sourceMask') !== undefined
          ? drawerForm.getFieldValue('sourceNetworkAddress')
          : drawerForm.getFieldValue('sourceIp')
      }
    }

    let destIpSettings = {} as { subnet: string, ipMask: string, ip: string }
    if (drawerForm.getFieldValue('destType') !== AnyText) {
      destIpSettings = {
        subnet: drawerForm.getFieldValue('destNetworkAddress') ?? '',
        ipMask: drawerForm.getFieldValue('destMask') ?? '',
        ip: drawerForm.getFieldValue('destMask') !== undefined
          ? drawerForm.getFieldValue('destNetworkAddress')
          : drawerForm.getFieldValue('destIp')
      }
    }

    const ruleObject = {
      description: drawerForm.getFieldValue('description') ?? '',
      access: drawerForm.getFieldValue('access'),
      protocol: drawerForm.getFieldValue('protocol'),
      source: {
        type: drawerForm.getFieldValue('sourceType') ?? AnyText,
        ...sourceIpSettings,
        port: drawerForm.getFieldValue('sourcePort') ?? '',
        enableIpSubnet: drawerForm.getFieldValue('sourceMask') !== undefined
      },
      destination: {
        type: drawerForm.getFieldValue('destType') ?? AnyText,
        ...destIpSettings,
        port: drawerForm.getFieldValue('destPort') ?? '',
        enableIpSubnet: drawerForm.getFieldValue('destMask') !== undefined
      }
    }
    if (ruleDrawerEditMode && layer3Rule.hasOwnProperty('priority')) {
      const updateId = layer3Rule.priority - 1
      layer3RuleList[updateId] = {
        priority: layer3Rule.priority,
        ...ruleObject
      }
      setLayer3RuleList([...layer3RuleList])
    } else {
      setLayer3RuleList([
        ...layer3RuleList, {
          priority: layer3RuleList.length + 1,
          ...ruleObject
        }
      ])
    }

  }

  const actions = !isViewMode() ? [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }] : []

  const isEmptyValues = (value: string | boolean | undefined): boolean => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim().length === 0)
    )
  }

  const convertToPayload = (policyId?: string) => {
    let id = {}
    if (policyId) {
      id = { id: policyId }
    }
    let payload = {
      name: policyName,
      defaultAccess: accessStatus,
      l3Rules: [...layer3RuleList.map(rule => {
        rule.source.enableIpSubnet = rule.source.ipMask !== '' && rule.source.ipMask !== undefined
        // eslint-disable-next-line max-len
        rule.destination.enableIpSubnet = rule.destination.ipMask !== '' && rule.destination.ipMask !== undefined
        return {
          priority: rule.priority,
          access: rule.access,
          source: { ..._.omitBy(rule.source, isEmptyValues) },
          destination: { ..._.omitBy(rule.destination, isEmptyValues) },
          description: rule.description,
          protocol: rule.protocol !== Layer3ProtocolType.ANYPROTOCOL ? rule.protocol : null
        }
      })],
      description: description
    }

    return {
      ...id,
      ...payload
    }
  }

  const handleL3AclPolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        const l3AclRes: CommonResult = await createL3AclPolicy({
          params: params,
          payload: convertToPayload(),
          enableRbac: resolvedRbacEnabled
        }).unwrap()
        // let responseData = l3AclRes.response as {
        //   [key: string]: string
        // }
        // form.setFieldValue([...inputName, 'l3AclPolicyId'], responseData.id)
        // setQueryPolicyId(responseData.id)
        setRequestId(l3AclRes.requestId)
        setQueryPolicyName(policyName)
      } else {
        await updateL3AclPolicy({
          params: { ...params, l3AclPolicyId: queryPolicyId },
          payload: convertToPayload(queryPolicyId),
          enableRbac: resolvedRbacEnabled
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const updateDrawerFromValues = (ruleObj: Layer3Rule) => {
    drawerForm.setFieldValue('description', ruleObj.description)
    drawerForm.setFieldValue('access', ruleObj.access)
    drawerForm.setFieldValue('protocol', ruleObj.protocol)
    drawerForm.setFieldValue('source', ruleObj.source)
    let sourceValue = 1
    if (ruleObj.source.ipMask) {
      drawerForm.setFieldValue(['sourceNetworkAddress'], ruleObj.source.ip)
      drawerForm.setFieldValue(['sourceMask'], ruleObj.source.ipMask)
      sourceValue = 2
    } else if (ruleObj.source.ip) {
      drawerForm.setFieldValue(
        ['sourceIp'], ruleObj.source.ip
      )
      sourceValue = 3
    }
    setSourceValue(sourceValue)

    drawerForm.setFieldValue(['sourcePort'], ruleObj.source.port)
    drawerForm.setFieldValue('destination', ruleObj.destination)
    let destValue = 1
    if (ruleObj.destination.ipMask) {
      drawerForm.setFieldValue(['destNetworkAddress'], ruleObj.destination.ip)
      drawerForm.setFieldValue(['destMask'], ruleObj.destination.ipMask)
      destValue = 2
    } else if (ruleObj.destination.ip) {
      drawerForm.setFieldValue(
        ['destIp'], ruleObj.destination.ip
      )
      destValue = 3
    }
    setDestValue(destValue)

    drawerForm.setFieldValue(['destPort'], ruleObj.destination.port)
  }

  const rowActions: TableProps<Layer3Rule>['rowActions'] = isViewMode() ? [] : [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([editRow]: Layer3Rule[], clearSelection: () => void) => {
      setRuleDrawerVisible(true)
      setRuleDrawerEditMode(true)
      setLayer3Rule(editRow)
      updateDrawerFromValues(editRow)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([{ priority }]: Layer3Rule[], clearSelection: () => void) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: priority.toString()
        },
        onOk: () => {
          setLayer3RuleList(layer3RuleList
            .filter((rule: Layer3Rule) => rule.priority !== priority)
            .map((rule: Layer3Rule, ruleId: number) => {
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

  const EmptyElement = (props: { access: AccessStatus }) => {
    useEffect(() => {
      drawerForm.setFieldValue('layer3DefaultAccess', props.access)
    }, [props])
    return <></>
  }

  const DefaultEmptyElement = (props: { access: AccessStatus }) => {
    useEffect(() => {
      contentForm.setFieldValue('layer3DefaultAccess', props.access)
    }, [props])
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
      value: AccessStatus.ALLOW
    },
    {
      label: $t({ defaultMessage: 'Block Traffic' }),
      children: <DefaultEmptyElement access={AccessStatus.BLOCK} />,
      value: AccessStatus.BLOCK
    }
  ]

  const selectProtocol = (
    <Select
      style={{ width: '100%' }}
      onChange={(evt) => {
        setLayer3Rule({
          ...layer3Rule,
          protocol: evt
        })
      }}
    >
      {Object.keys(Layer3ProtocolType).map((type, index) => {
        return (
          <Option value={type} key={index}>
            {$t(layer3ProtocolLabelMapping[type as keyof typeof Layer3ProtocolType])}
          </Option>
        )
      })}
    </Select>
  )

  // @ts-ignore
  const DraggableRow = (props) => {
    const ref = useRef(null)
    const { className, onClick, ...restProps } = props

    const [, drag] = useDrag(() => ({
      type: 'DraggableRow',
      item: {
        id: props['data-row-key']
      },
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    }))

    const [{ isOver }, drop] = useDrop({
      accept: 'DraggableRow',
      drop: (item: DragItemProps) => {
        // @ts-ignore
        const hoverIdx = Number(ref.current.getAttribute('data-row-key'))
        const idx = item.id ?? -1
        if (idx && idx !== hoverIdx) {
          let oldIndex = idx - 1
          let newIndex = hoverIdx -1
          const dragAndDropRules = [...layer3RuleList] as Layer3Rule[]
          [dragAndDropRules[oldIndex], dragAndDropRules[newIndex]] =
            [dragAndDropRules[newIndex], dragAndDropRules[oldIndex]]
          setLayer3RuleList(dragAndDropRules.map((rule, i) => {
            return {
              ...rule,
              priority: i + 1
            }
          }))
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    })

    drag(drop(ref))

    return (
      <tr
        ref={ref}
        className={className}
        onClick={onClick}
        {...restProps}
        style={isOver ? {
          backgroundColor: 'var(--acx-accents-blue-10)',
          borderColor: 'var(--acx-accents-blue-10)'
        } : {}}
      >
        {props.children}
      </tr>
    )
  }

  const ruleContent = <Form layout='horizontal' form={drawerForm}>
    <PolicyFormItem
      name='description'
      label={$t({ defaultMessage: 'Description' })}
      initialValue={''}
      validateFirst
      rules={[
        { max: 64 }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a short description, up to 64 characters' })}
      />}
    />
    <PolicyFormItem
      name='access'
      label={$t({ defaultMessage: 'Access' })}
      initialValue={AccessStatus.ALLOW}
      children={<ContentSwitcher tabDetails={tabDetails} size='large' />}
    />
    <PolicyFormItem
      name='protocol'
      label={$t({ defaultMessage: 'Protocol' })}
      initialValue={Layer3ProtocolType.ANYPROTOCOL}
      children={selectProtocol}
    />
    <Fieldset
      label={$t({ defaultMessage: 'Source' })}
      switchStyle={{ display: 'none' }}
      checked={true}
    >
      <Radio.Group
        onChange={onSourceChange}
        value={sourceValue}
        style={{ width: '100%', marginBottom: '10px' }}
      >
        <GridRow >
          <GridCol col={{ span: 24 }}>
            <Radio name={RuleSourceType.ANY} value={1}>
              {$t({ defaultMessage: 'Any IP Address' })}
            </Radio>
          </GridCol>

          <GridCol col={{ span: 5 }}>
            <Radio name={RuleSourceType.SUBNET} value={2}>
              {$t({ defaultMessage: 'Subnet Network Address' })}
            </Radio>
          </GridCol>
          <GridCol col={{ span: 19 }}>
            {sourceValue === 2
              ? <FormItemsWrapper>
                <Form.Item
                  name='sourceNetworkAddress'
                  rules={[
                    { required: true },
                    { validator: (_, value) => networkAddressValidator(value) }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Source Network Address' })}/>
                </Form.Item>
                <Form.Item
                  name='sourceMask'
                  validateFirst
                  rules={[
                    { required: true },
                    { validator: (_, value) => subnetMaskValidator(value) },
                    { validator: (_, value) => sourceIpModeValidator(value) }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Source Mask' })}/>
                </Form.Item>
              </FormItemsWrapper> : null}
          </GridCol>

          <GridCol col={{ span: 5 }}>
            <Radio name={RuleSourceType.IP} value={3}>
              {$t({ defaultMessage: 'IP Address' })}
            </Radio>
          </GridCol>
          <GridCol col={{ span: 19 }}>
            {sourceValue === 3 ? <Form.Item
              name='sourceIp'
              rules={[
                { required: true },
                { validator: (_, value) => networkAddressValidator(value) }
              ]}
            >
              <Input placeholder={$t({ defaultMessage: 'Source Ip' })}/>
            </Form.Item> : null}
          </GridCol>
        </GridRow>

      </Radio.Group>
      {/* eslint-disable-next-line max-len */}
      { ruleDrawerVisible && drawerForm && drawerForm.getFieldValue('protocol') !== Layer3ProtocolType.L3ProtocolEnum_ICMP_ICMPV4 && <PolicyFormItem
        name='sourcePort'
        label={$t({ defaultMessage: 'Port' })}
        initialValue={''}
        rules={[
          { validator: (_, value) => portRangeValidator(value) }
        ]}
        children={<Input
          placeholder={$t({ defaultMessage: 'Enter a port number or range (x-xxxx)' })}
        />}
      /> }
    </Fieldset>
    <Fieldset
      label={$t({ defaultMessage: 'Destination' })}
      switchStyle={{ display: 'none' }}
      checked={true}
    >
      <Radio.Group
        onChange={onDestChange}
        value={destValue}
        style={{ width: '100%', marginBottom: '10px' }}
      >
        <GridRow >
          <GridCol col={{ span: 24 }}>
            <Radio name={'a'} value={1}>
              {$t({ defaultMessage: 'Any IP Address' })}
            </Radio>
          </GridCol>

          <GridCol col={{ span: 5 }}>
            <Radio value={2}>
              {$t({ defaultMessage: 'Subnet Network Address' })}
            </Radio>
          </GridCol>
          <GridCol col={{ span: 19 }}>
            {destValue === 2
              ? <FormItemsWrapper>
                <Form.Item
                  name='destNetworkAddress'
                  validateFirst
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'You must specify subnet network' })
                    },
                    { validator: (_, value) => networkAddressValidator(value) },
                    { validator: (_, value) => sourceDestIpModeValidator(value) }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Destination Network Address' })}/>
                </Form.Item>
                <Form.Item
                  name='destMask'
                  validateFirst
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'You must specify mask' })
                    },
                    { validator: (_, value) => subnetMaskValidator(value) },
                    { validator: (_, value) => destIpModeValidator(value) }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Destination Mask' })}/>
                </Form.Item>
              </FormItemsWrapper> : null}
          </GridCol>

          <GridCol col={{ span: 5 }}>
            <Radio value={3}>
              {$t({ defaultMessage: 'IP Address' })}
            </Radio>
          </GridCol>
          <GridCol col={{ span: 19 }}>
            {destValue === 3 ? <Form.Item
              name='destIp'
              validateFirst
              rules={[
                { required: true, message: $t({
                  defaultMessage: 'You must specify IP Address'
                }) },
                { validator: (_, value) => networkAddressValidator(value) },
                { validator: (_, value) => sourceDestIpModeValidator(value) }
              ]}
            >
              <Input placeholder={$t({ defaultMessage: 'Destination Ip' })}/>
            </Form.Item> : null}
          </GridCol>
        </GridRow>

      </Radio.Group>
      {/* eslint-disable-next-line max-len */}
      { ruleDrawerVisible && drawerForm && drawerForm.getFieldValue('protocol') !== Layer3ProtocolType.L3ProtocolEnum_ICMP_ICMPV4 && <PolicyFormItem
        name='destPort'
        label={$t({ defaultMessage: 'Port' })}
        initialValue={''}
        rules={[
          { validator: (_, value) => portRangeValidator(value) }
        ]}
        children={<Input
          placeholder={$t({ defaultMessage: 'Enter a port number or range (x-xxxx)' })}
        />}
      /> }
    </Fieldset>
  </Form>

  const content = <>
    <Form layout={isComponentMode ? 'vertical' : 'horizontal'} form={contentForm}>
      <PolicyFormItem
        name={'policyName'}
        label={$t({ defaultMessage: 'Policy Name:' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: (_, value) => {
            if (layer3List && layer3List
              .filter(layer3 => editMode ? (layer3PolicyInfo?.name !== layer3) : true)
              .findIndex(layer3 => layer3 === value) !== -1) {
              return Promise.reject($t({
                defaultMessage: 'A policy with that name already exists'
              }))
            }
            return Promise.resolve()}
          }
        ]}
        children={<Input disabled={isViewMode()}/>}
      />
      <PolicyFormItem
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        rules={[
          { max: 255 }
        ]}
        children={<TextArea disabled={isViewMode()} />}
      />
      <PolicyFormItem
        name='layer3DefaultAccess'
        label={<div style={{ textAlign: 'left' }}>
          <div>{$t({ defaultMessage: 'Default Access' })}</div>
          <span style={{ fontSize: '10px' }}>
            {$t({ defaultMessage: 'Applies if no rule is matched' })}
          </span>
        </div>}
        children={<ContentSwitcher
          formInitValue={(layer3PolicyInfo &&
            (isViewMode() || editMode.isEdit || localEditMode.isEdit))
            ? layer3PolicyInfo.defaultAccess
            : AccessStatus.ALLOW}
          tabDetails={defaultTabDetails}
          size='large' />}
      />
      <PolicyFormItem
        name='layer3Rule'
        label={$t({ defaultMessage: 'Layer 3 Rules' }) + ` (${layer3RuleList.length})`}
        children={<></>}
      />
      <DndProvider backend={HTML5Backend} >
        {isOnlyViewMode && !editMode.isEdit ? <Table
          columns={basicColumns}
          dataSource={layer3RuleList as Layer3Rule[]}
        /> : <Table
          columns={basicColumns}
          dataSource={layer3RuleList as Layer3Rule[]}
          rowKey='priority'
          actions={filterByAccess(actions)}
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
          components={{
            body: {
              row: DraggableRow
            }
          }}
        />}
      </DndProvider>
    </Form>
    <Drawer
      title={ruleDrawerEditMode
        ? $t({ defaultMessage: 'Edit Layer 3 Rule' })
        : $t({ defaultMessage: 'Add Layer 3 Rule' })
      }
      visible={ruleDrawerVisible}
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

              handleLayer3Rule()
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

  const portRangeValidator = (value: string) => {
    const validationList: string[] = value.split('-')
    if (value.includes('-')) {
      if (validationList[1] === '' || Number(validationList[0]) >= Number(validationList[1])) {
        return Promise.reject($t({
          defaultMessage: 'Please enter another valid number between {number} and 65535'
        }, {
          number: Number(validationList[0]) + 1
        }))
      }
    }
    return Promise.all(validationList.map(value => portRegExp(value)))
  }

  const subnetMaskValidator = (value: string)=>{
    if (isApIpModeFFEnabled && !isTemplate) {
      return dualModeSubnetMaskIpRegExp(value)
    }
    return subnetMaskIpRegExp(value)
  }

  const networkAddressValidator = (value: string)=>{
    if (isApIpModeFFEnabled && !isTemplate) {
      return networkWifiDualModeIpRegExp(value)
    }
    return networkWifiIpRegExp(value)
  }

  const ipModeValidator = (address: string, subnetMask: string)=>{
    return customizePromiseAny([
      Promise.all([networkWifiIpRegExp(address), subnetMaskIpRegExp(subnetMask)]),
      Promise.all([ipv6RegExp(address), ipv6PrefixRegExp(subnetMask)])],
    new Error($t({ defaultMessage: 'Ip mode must same between address and subnet mask.' }))
    )
  }

  const sourceIpModeValidator = (value: string)=>{
    if (isApIpModeFFEnabled && !isTemplate) {
      const address = drawerForm.getFieldValue('sourceNetworkAddress')
      return ipModeValidator(address, value)
    }
    return Promise.resolve()
  }

  const destIpModeValidator = (value: string)=>{
    if (isApIpModeFFEnabled && !isTemplate) {
      const address = drawerForm.getFieldValue('destNetworkAddress')
      return ipModeValidator(address, value)
    }
    return Promise.resolve()
  }

  const sourceDestIpModeValidator = (destIp: string)=>{
    if (isApIpModeFFEnabled && !isTemplate) {
      const sourceNetworkAddress = drawerForm.getFieldValue('sourceNetworkAddress')
      const sourceIp = drawerForm.getFieldValue('sourceIp')
      if (sourceNetworkAddress !== undefined || sourceIp !== undefined) {
        const source = (sourceNetworkAddress !== undefined) ? sourceNetworkAddress : sourceIp
        return customizePromiseAny([
          Promise.all([networkWifiIpRegExp(destIp), networkWifiIpRegExp(source)]),
          Promise.all([ipv6RegExp(destIp), ipv6RegExp(source)])],
        new Error($t({ defaultMessage: 'Ip mode must same between source and destination.' })))
      }
      return Promise.resolve()
    }
    return Promise.resolve()
  }

  const hasCreatePermission = useTemplateAwarePolicyPermission(
    PolicyType.LAYER_3_POLICY, PolicyOperation.CREATE
  )

  const hasEditPermission = useTemplateAwarePolicyPermission(
    PolicyType.LAYER_3_POLICY, PolicyOperation.EDIT
  )

  const modelContent = () => {
    if (isComponentMode || onlyAddMode.enable || drawerViewModeId !== '') {
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
          name={[...inputName, 'l3AclPolicyId']}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select Layer 3 profile' })
          }]}
          children={
            <Select
              style={{ width: '150px' }}
              placeholder={$t({ defaultMessage: 'Select profile...' })}
              disabled={visible}
              onChange={(value) => {
                setQueryPolicyId(value)
              }}
              children={layer3SelectOptions}
            />
          }
        />
      </GridCol>
      <AclGridCol>
        {hasEditPermission &&
          <Button type='link'
            disabled={visible || !l3AclPolicyId}
            onClick={() => {
              if (l3AclPolicyId) {
                setDrawerVisible(true)
                setQueryPolicyId(l3AclPolicyId)
                setLocalEdiMode({ id: l3AclPolicyId, isEdit: true })
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
            disabled={visible || layer3List.length >= PROFILE_MAX_COUNT_LAYER3_POLICY}
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
      {isComponentMode && <>
        <PageHeader
          title={pageTitle}
          breadcrumb={breadcrumb}
        />
        <Loader states={[{ isLoading: false, isFetching: false }]}>
          <StepsForm
            form={form}
            editMode={editMode.isEdit || localEditMode.isEdit}
            onCancel={handleContentClose}
            onFinish={handleContentFinish}
          >
            <StepsForm.StepForm
              name='settings'
              title={$t({ defaultMessage: 'Settings' })}
            >
              {content}
            </StepsForm.StepForm>
          </StepsForm>
        </Loader>
      </>}
      {!isComponentMode &&<Drawer
        title={$t({ defaultMessage: 'Layer 3 Settings' })}
        visible={visible}
        onClose={() => handleContentClose()}
        destroyOnClose={true}
        children={content}
        push={false}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            showSaveButton={!isViewMode()}
            onCancel={handleContentClose}
            onSave={handleContentFinish}
          />
        }
        width={'870px'}
      />}
    </>
  )
}

// eslint-disable-next-line max-len
const useGetL3AclPolicyListInstance = (isEdit: boolean, enableRbac: boolean, notForQueryList: boolean): {
  layer3SelectOptions: JSX.Element[], layer3List: string[]
} => {
  const { data } = useConfigTemplateQueryFnSwitcher<TableResult<L3AclPolicy>>({
    useQueryFn: useGetEnhancedL3AclProfileListQuery,
    useTemplateQueryFn: useGetL3AclPolicyTemplateListQuery,
    skip: notForQueryList || isEdit,
    payload: QUERY_DEFAULT_PAYLOAD,
    enableRbac: enableRbac
  })

  return {
    layer3SelectOptions: data?.data?.map(
      item => {
        return <Option key={item.id}>{item.name}</Option>
      }) ?? [],
    layer3List: data?.data.map(item => item.name) ?? []
  }
}

