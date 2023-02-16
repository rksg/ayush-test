import React, { ReactNode, useEffect, useState } from 'react'

import { Form, FormItemProps, Input, Radio, RadioChangeEvent, Select } from 'antd'
import _                                                               from 'lodash'
import { useIntl }                                                     from 'react-intl'
import { useParams }                                                   from 'react-router-dom'
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortableElementProps,
  SortableHandle
} from 'react-sortable-hoc'
import styled from 'styled-components/macro'

import {
  Button,
  ContentSwitcher, ContentSwitcherProps,
  Drawer,
  Fieldset,
  GridCol,
  GridRow,
  showActionModal, showToast,
  Table,
  TableProps
} from '@acx-ui/components'
import { Drag }             from '@acx-ui/icons'
import {
  useAddL3AclPolicyMutation,
  useGetL3AclPolicyQuery,
  useL3AclPolicyListQuery
} from '@acx-ui/rc/services'
import {
  AccessStatus,
  CommonResult,
  Layer3ProtocolType,
  MacAddressFilterRegExp,
  serverIpAddressRegExp,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'

import { layer3ProtocolLabelMapping } from '../../contentsMap'

const { useWatch } = Form
const { Option } = Select

export interface Layer3DrawerProps {
  inputName?: string[]
}

interface Layer3NetworkCol {
  type: string,
  subnet?: string,
  mask?: string,
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

const Layer3Drawer = (props: Layer3DrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { inputName = [] } = props
  const [visible, setVisible] = useState(false)
  const form = Form.useFormInstance()
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [layer3RuleList, setLayer3RuleList] = useState([] as Layer3Rule[])
  const [layer3Rule, setLayer3Rule] = useState({} as Layer3Rule)
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [queryPolicyName, setQueryPolicyName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [contentForm] = Form.useForm()
  const [drawerForm] = Form.useForm()

  const AnyText = $t({ defaultMessage: 'Any' })

  const [
    accessStatus,
    policyName,
    l3AclPolicyId
  ] = [
    useWatch<string>('layer3Access', contentForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>([...inputName, 'l3AclPolicyId'])
  ]

  const [ createL3AclPolicy ] = useAddL3AclPolicyMutation()

  const { layer3SelectOptions, layer3List } = useL3AclPolicyListQuery({
    params: { ...params, requestId: requestId },
    payload: {
      fields: ['name', 'id'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  }, {
    selectFromResult ({ data }) {
      return {
        layer3SelectOptions: data?.data?.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) ?? [],
        layer3List: data?.data?.map(item => item.name)
      }
    }
  })

  const { data: layer3PolicyInfo } = useGetL3AclPolicyQuery(
    {
      params: { ...params, l3AclPolicyId: l3AclPolicyId }
    },
    { skip: l3AclPolicyId === '' || l3AclPolicyId === undefined }
  )

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    return !_.isNil(layer3PolicyInfo)
  }

  useEffect(() => {
    if (isViewMode() && layer3PolicyInfo) {
      contentForm.setFieldValue('policyName', layer3PolicyInfo.name)
      contentForm.setFieldValue('layer3Access', layer3PolicyInfo.defaultAccess)
      setLayer3RuleList([...layer3PolicyInfo.l3Rules.map(l3Rule => ({
        access: l3Rule.access,
        description: l3Rule.description,
        priority: l3Rule.priority,
        protocol: 'l3Rule.protocol',
        source: { ...l3Rule.source },
        destination: { ...l3Rule.destination }
      }))] as Layer3Rule[])
    }
  }, [layer3PolicyInfo, queryPolicyId])

  // use policyName to find corresponding id before API return profile id
  useEffect(() => {
    if (requestId && queryPolicyName) {
      layer3SelectOptions.map(option => {
        if (option.props.children === queryPolicyName) {
          form.setFieldValue([...inputName, 'l3AclPolicyId'], option.key)
          setQueryPolicyId(option.key as string)
          setQueryPolicyName('')
          setRequestId('')
        }
      })
    }
  }, [layer3SelectOptions, requestId, policyName])

  const DragHandle = SortableHandle(() =>
    <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
  )

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
      render: (data, row) => {
        return <NetworkColumnComponent network={row.source} />
      }
    },
    {
      title: $t({ defaultMessage: 'Destination' }),
      dataIndex: 'destination',
      key: 'destination',
      render: (data, row) => {
        return <NetworkColumnComponent network={row.destination} />
      }
    },
    {
      title: $t({ defaultMessage: 'Protocol' }),
      dataIndex: 'protocol',
      key: 'protocol'
    },
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      render: (data, row) => {
        return <div data-testid={`${row.priority}_Icon`} style={{ textAlign: 'center' }}>
          <DragHandle/>
        </div>
      }
    }
  ]

  const [sourceValue, setSourceValue] = useState(1)
  const [destValue, setDestValue] = useState(1)

  const RuleSource =[RuleSourceType.ANY, RuleSourceType.SUBNET, RuleSourceType.IP]

  const NetworkColumnComponent = (props: { network: Layer3NetworkCol }) => {
    const { network } = props

    let ipString = network.type ?? RuleSourceType.ANY
    if (network && network.type === RuleSourceType.SUBNET) {
      ipString = `${network.subnet}/${network.mask}`
    }
    if (network && network.type === RuleSourceType.IP) {
      ipString = `${network.ip}`
    }

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span>{$t({ defaultMessage: 'IP:' })} {ipString}</span>
      <span>{$t({ defaultMessage: 'Port:' })} {network.port === '' ? AnyText : network.port }</span>
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
    contentForm.setFieldValue('layer3Access', undefined)
    setLayer3RuleList([])
  }

  const handleLayer3DrawerClose = () => {
    setVisible(false)
    setQueryPolicyId('')
    clearFieldsValue()
  }

  const handleLayer3Rule = () => {
    setRuleDrawerEditMode(false)

    const ruleObject = {
      description: drawerForm.getFieldValue('description') ?? '',
      access: drawerForm.getFieldValue('access'),
      protocol: drawerForm.getFieldValue('protocol'),
      source: {
        type: drawerForm.getFieldValue('sourceType') ?? AnyText,
        subnet: drawerForm.getFieldValue('sourceNetworkAddress') ?? '',
        mask: drawerForm.getFieldValue('sourceMask') ?? '',
        ip: drawerForm.getFieldValue('sourceIp') ?? '',
        port: drawerForm.getFieldValue('sourcePort') ?? ''
      },
      destination: {
        type: drawerForm.getFieldValue('destType') ?? AnyText,
        subnet: drawerForm.getFieldValue('destNetworkAddress') ?? '',
        mask: drawerForm.getFieldValue('destMask') ?? '',
        ip: drawerForm.getFieldValue('destIp') ?? '',
        port: drawerForm.getFieldValue('destPort') ?? ''
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

  const handleL3AclPolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        const l3AclRes: CommonResult = await createL3AclPolicy({
          params: params,
          payload: {
            name: policyName,
            defaultAccess: accessStatus,
            l3Rules: [...layer3RuleList.map(rule => {
              return {
                priority: rule.priority,
                access: rule.access,
                source: { ..._.omitBy(rule.source, _.isEmpty) },
                destination: { ..._.omitBy(rule.destination, _.isEmpty) },
                description: rule.description
              }
            })],
            description: null
          }
        }).unwrap()
        // let responseData = l3AclRes.response as {
        //   [key: string]: string
        // }
        // form.setFieldValue([...inputName, 'l3AclPolicyId'], responseData.id)
        // setQueryPolicyId(responseData.id)
        setRequestId(l3AclRes.requestId)
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

  const updateDrawerFromValues = (ruleObj: Layer3Rule) => {
    drawerForm.setFieldValue('description', ruleObj.description)
    drawerForm.setFieldValue('access', ruleObj.access)
    drawerForm.setFieldValue('protocol', ruleObj.protocol)
    drawerForm.setFieldValue('source', ruleObj.source)
    drawerForm.setFieldValue(['sourceNetworkAddress'], ruleObj.source.subnet)
    drawerForm.setFieldValue(['sourceMask'], ruleObj.source.mask)
    drawerForm.setFieldValue(['sourceIp'], ruleObj.source.ip)
    drawerForm.setFieldValue(['sourcePort'], ruleObj.source.port)
    drawerForm.setFieldValue('destination', ruleObj.destination)
    drawerForm.setFieldValue(['destinationNetworkAddress'], ruleObj.destination.subnet)
    drawerForm.setFieldValue(['destinationMask'], ruleObj.destination.mask)
    drawerForm.setFieldValue(['destinationIp'], ruleObj.destination.ip)
    drawerForm.setFieldValue(['destinationPort'], ruleObj.destination.port)
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
    onClick: ([{ priority }]: Layer3Rule[]) => {
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
        }
      })
    }
  }] as { label: string, onClick: () => void }[]

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
      {Object.keys(Layer3ProtocolType).map((type) => (
        <Option value={type}>
          {$t(layer3ProtocolLabelMapping[type as keyof typeof Layer3ProtocolType])}
        </Option>
      ))}
    </Select>
  )

  // @ts-ignore
  const SortableItem = SortableElement((props: SortableElementProps) => <tr {...props} />)
  // @ts-ignore
  const SortContainer = SortableContainer((props: SortableContainerProps) => <tbody {...props} />)

  const DraggableContainer = (props: SortableContainerProps) => {
    return <SortContainer
      useDragHandle
      disableAutoscroll
      onSortEnd={({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        const dragAndDropRules = [...layer3RuleList] as Layer3Rule[]
        [dragAndDropRules[oldIndex], dragAndDropRules[newIndex]] =
          [dragAndDropRules[newIndex], dragAndDropRules[oldIndex]]
        setLayer3RuleList(dragAndDropRules.map((rule, i) => {
          return {
            ...rule,
            priority: i + 1
          }
        }))
      }}
      {...props}
    />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props
    const index = layer3RuleList.findIndex((x) => x.priority === restProps['data-row-key'])
    return <SortableItem index={index} {...restProps} />
  }

  const content = <Form layout='horizontal' form={contentForm}>
    <DrawerFormItem
      name={'policyName'}
      label={$t({ defaultMessage: 'Policy Name:' })}
      rules={[
        { required: true,
          validator: (_, value) => {
            if (layer3List && layer3List.find(layer3 => layer3 === value)) {
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
      name='layer3DefaultAccess'
      label={<div style={{ textAlign: 'left' }}>
        <div>{$t({ defaultMessage: 'Default Access' })}</div>
        <span style={{ fontSize: '10px' }}>
          {$t({ defaultMessage: 'Applies if no rule is matched' })}
        </span>
      </div>}
      children={<ContentSwitcher tabDetails={defaultTabDetails} size='large' />}
    />
    <DrawerFormItem
      name='layer3Rule'
      label={$t({ defaultMessage: 'Layer 3 Rules' }) + ` (${layer3RuleList.length})`}
    />
    <Table
      columns={basicColumns}
      dataSource={layer3RuleList as Layer3Rule[]}
      rowKey='priority'
      actions={actions}
      rowActions={rowActions}
      rowSelection={{ type: 'radio' }}
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow
        }
      }}
    />
  </Form>

  const ruleContent = <Form layout='horizontal' form={drawerForm}>
    <DrawerFormItem
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
    <DrawerFormItem
      name='access'
      label={$t({ defaultMessage: 'Access' })}
      initialValue={AccessStatus.ALLOW}
      children={<ContentSwitcher tabDetails={tabDetails} size='large' />}
    />
    <DrawerFormItem
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
                    { validator: (_, value) => MacAddressFilterRegExp(value) }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Source Network Address' })}/>
                </Form.Item>
                <Form.Item
                  name='sourceMask'
                  rules={[
                    { required: true },
                    { validator: (_, value) => subnetMaskIpRegExp(value) }
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
                { validator: (_, value) => serverIpAddressRegExp(value) }
              ]}
            >
              <Input placeholder={$t({ defaultMessage: 'Source Ip' })}/>
            </Form.Item> : null}
          </GridCol>
        </GridRow>

      </Radio.Group>
      <DrawerFormItem
        name='sourcePort'
        label={$t({ defaultMessage: 'Port' })}
        initialValue={''}
        rules={[
          { max: 64 }
        ]}
        children={<Input
          placeholder={$t({ defaultMessage: 'Enter a port number or range (x-xxxx)' })}
        />}
      />
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
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'You must specify subnet network' })
                    }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Destination Network Address' })}/>
                </Form.Item>
                <Form.Item
                  name='destMask'
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'You must specify mask' })
                    }
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
              rules={[
                { required: true, message: $t({
                  defaultMessage: 'You must specify IP Address'
                }) }
              ]}
            >
              <Input placeholder={$t({ defaultMessage: 'Destination Ip' })}/>
            </Form.Item> : null}
          </GridCol>
        </GridRow>

      </Radio.Group>
      <DrawerFormItem
        name='destPort'
        label={$t({ defaultMessage: 'Port' })}
        initialValue={''}
        rules={[
          { max: 64 }
        ]}
        children={<Input
          placeholder={$t({ defaultMessage: 'Enter a port number or range (x-xxxx)' })}
        />}
      />
    </Fieldset>
  </Form>

  return (
    <>
      <GridRow style={{ width: '350px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            name={[...inputName, 'l3AclPolicyId']}
            rules={[{
              message: $t({ defaultMessage: 'Please select Layer 3 profile' })
            }]}
            children={
              <Select
                placeholder={$t({ defaultMessage: 'Select profile...' })}
                onChange={(value) => {
                  setQueryPolicyId(value)
                }}
                children={layer3SelectOptions}
              />
            }
          />
        </GridCol>
        <AclGridCol>
          <Button type='link'
            disabled={!l3AclPolicyId}
            onClick={() => {
              if (l3AclPolicyId) {
                setVisible(true)
                setQueryPolicyId(l3AclPolicyId)
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
        title={$t({ defaultMessage: 'Layer 3 Settings' })}
        visible={visible}
        zIndex={10}
        onClose={handleLayer3DrawerClose}
        destroyOnClose={true}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleLayer3DrawerClose}
            onSave={async () => {
              try {
                await contentForm.validateFields()
                if (!isViewMode()) {
                  await handleL3AclPolicy(false)
                }
                handleLayer3DrawerClose()
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
          ? $t({ defaultMessage: 'Edit Layer 3 Rule' })
          : $t({ defaultMessage: 'Add Layer 3 Rule' })
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
  )
}

export default Layer3Drawer
