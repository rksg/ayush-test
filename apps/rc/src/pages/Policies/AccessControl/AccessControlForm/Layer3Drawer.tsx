import React, { useState } from 'react'

import { Form, Input, Radio, RadioChangeEvent } from 'antd'
import { useIntl }                              from 'react-intl'

import { Button, Drawer, Fieldset, GridCol, GridRow, showActionModal, Table, TableProps } from '@acx-ui/components'
import { DownloadOutlined }                                                               from '@acx-ui/icons'
import { macAddressRegExp, serverIpAddressRegExp, subnetMaskIpRegExp }                    from '@acx-ui/rc/utils'

const { useWatch } = Form

interface Layer3NetworkCol {
  type: string,
  subnet?: string,
  mask?: string,
  ip?: string,
  port: string
}


interface Layer3Rule {
  id: number,
  description: string,
  access: string,
  protocol: string,
  source: Layer3NetworkCol,
  destination: Layer3NetworkCol
}


const Layer3Drawer = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(true)
  const form = Form.useFormInstance()
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [ruleDrawerEditMode, setRuleDrawerEditMode] = useState(false)
  const [layer3RuleList, setLayer3RuleList] = useState(
    form.getFieldValue(['accessControlComponent', 'layer3', 'ruleList']) ?? [] as Layer3Rule[]
  )
  const [layer3Rule, setLayer3Rule] = useState({} as Layer3Rule)
  const [drawerForm] = Form.useForm()

  const [
    defaultAccessStatus,
    accessStatus
  ] = [
    useWatch<string>(['accessControlComponent', 'layer3', 'defaultAccess']),
    useWatch<string>(['accessControlComponent', 'layer3', 'access'])
  ]

  const basicColumns: TableProps<Layer3Rule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Priority' }),
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description'
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
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'source',
      key: 'source',
      render: (data, row) => {
        return renderNetworkColumn(row.source)
      }
    },
    {
      title: $t({ defaultMessage: 'Destination' }),
      dataIndex: 'destination',
      key: 'destination',
      render: (data, row) => {
        return renderNetworkColumn(row.destination)
      }
    },
    {
      title: $t({ defaultMessage: 'Protocol' }),
      dataIndex: 'protocol',
      key: 'protocol'
    }
  ]

  const [sourceValue, setSourceValue] = useState(1)
  const [destValue, setDestValue] = useState(1)

  const RuleSource =['Any', 'Subnet', 'Ip']

  const renderNetworkColumn = (network: Layer3NetworkCol) => {
    if (network && network.type === 'Subnet') {
      return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{$t({ defaultMessage: 'IP:' })} {`${network.subnet}/${network.mask}`}</span>
        <span>{$t({ defaultMessage: 'Port:' })} {network.port === '' ? 'Any' : network.port }</span>
      </div>
    }
    if (network && network.type === 'Ip') {
      return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{$t({ defaultMessage: 'IP:' })} {`${network.ip}`}</span>
        <span>{$t({ defaultMessage: 'Port:' })} {network.port === '' ? 'Any' : network.port }</span>
      </div>
    }

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span>{$t({ defaultMessage: 'IP:' })} {network.type ?? 'Any'}</span>
      <span>{$t({ defaultMessage: 'Port:' })} {network.port === '' ? 'Any' : network.port }</span>
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

  const handleLayer3DrawerClose = () => {
    setVisible(false)
    setLayer3RuleList(form.getFieldValue(['accessControlComponent', 'layer3', 'ruleList']))
  }

  const handleLayer3Rule = () => {
    setRuleDrawerEditMode(false)

    const ruleObject = {
      description: drawerForm.getFieldValue('description') ?? '',
      access: form.getFieldValue(['accessControlComponent', 'layer3', 'access']),
      protocol: drawerForm.getFieldValue('protocol'),
      source: {
        type: drawerForm.getFieldValue('sourceType') ?? 'Any',
        subnet: drawerForm.getFieldValue('sourceNetworkAddress') ?? '',
        mask: drawerForm.getFieldValue('sourceMask') ?? '',
        ip: drawerForm.getFieldValue('sourceIp') ?? '',
        port: drawerForm.getFieldValue('sourcePort') ?? ''
      },
      destination: {
        type: drawerForm.getFieldValue('destType') ?? 'Any',
        subnet: drawerForm.getFieldValue('destNetworkAddress') ?? '',
        mask: drawerForm.getFieldValue('destMask') ?? '',
        ip: drawerForm.getFieldValue('destIp') ?? '',
        port: drawerForm.getFieldValue('destPort') ?? ''
      }
    }
    if (ruleDrawerEditMode && layer3Rule.hasOwnProperty('id')) {
      const updateId = layer3Rule.id - 1
      layer3RuleList[updateId] = {
        id: layer3Rule.id,
        ...ruleObject
      }
      setLayer3RuleList([...layer3RuleList])
    } else {
      setLayer3RuleList([
        ...layer3RuleList, {
          id: layer3RuleList.length + 1,
          ...ruleObject
        }
      ])
    }

  }

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }]

  const rowActions: TableProps<Layer3Rule>['actions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([editRow]: Layer3Rule[], clearSelection: () => void) => {
      setRuleDrawerVisible(true)
      setRuleDrawerEditMode(true)
      setLayer3Rule(editRow)
      drawerForm.setFieldValue('description', editRow.description)
      drawerForm.setFieldValue('access', editRow.access)
      drawerForm.setFieldValue('protocol', editRow.protocol)
      drawerForm.setFieldValue('source', editRow.source)
      drawerForm.setFieldValue('destination', editRow.destination)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([{ id }]: Layer3Rule[]) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: id.toString()
        },
        onOk: () => {
          setLayer3RuleList(layer3RuleList
            .filter((rule: Layer3Rule) => rule.id !== id)
            .map((rule: Layer3Rule, ruleId: number) => {
              return {
                ...rule,
                id: ruleId + 1
              }
            }))
        }
      })
    }
  }, {
    label: $t({ defaultMessage: 'Move up' }),
    onClick: ([editRow]: Layer3Rule[], clearSelection: () => void) => {
      if (editRow.id === 1) return
      [layer3RuleList[editRow.id - 1 - 1], layer3RuleList[editRow.id - 1]]
        = [layer3RuleList[editRow.id - 1], layer3RuleList[editRow.id - 1 - 1]]
      setLayer3RuleList(layer3RuleList.map((rule: Layer3Rule, ruleId: number) => {
        return {
          ...rule,
          id: ruleId + 1
        }
      }))
      clearSelection()
    }
  }, {
    label: $t({ defaultMessage: 'Move down' }),
    onClick: ([editRow]: Layer3Rule[], clearSelection: () => void) => {
      if (editRow.id === layer3RuleList.length) return
      [layer3RuleList[editRow.id - 1 + 1], layer3RuleList[editRow.id - 1]]
        = [layer3RuleList[editRow.id - 1], layer3RuleList[editRow.id - 1 + 1]]
      setLayer3RuleList(layer3RuleList.map((rule: Layer3Rule, ruleId: number) => {
        return {
          ...rule,
          id: ruleId + 1
        }
      }))
      clearSelection()
    }
  }] as { label: string, onClick: () => void }[]

  const selectProtocol = (
    <select
      style={{ width: '100%' }}
      onChange={(evt) => {
        setLayer3Rule({
          ...layer3Rule,
          protocol: evt.target.value
        })
      }}
    >
      <option value='ANYPROTOCOL'>
        {$t({ defaultMessage: 'Any Protocol' })}
      </option>
      <option value='TCP'>
        {$t({ defaultMessage: 'TCP' })}
      </option>
      <option value='UDP'>
        {$t({ defaultMessage: 'UDP' })}
      </option>
      <option value='UDPLITE'>
        {$t({ defaultMessage: 'UDPLITE' })}
      </option>
      <option value='ICMP'>
        {$t({ defaultMessage: 'ICMP(ICMPV4)' })}
      </option>
      <option value='IGMP'>
        {$t({ defaultMessage: 'IGMP' })}
      </option>
      <option value='ESP'>
        {$t({ defaultMessage: 'ESP' })}
      </option>
      <option value='AH'>
        {$t({ defaultMessage: 'AH' })}
      </option>
      <option value='SCTP'>
        {$t({ defaultMessage: 'SCTP' })}
      </option>
    </select>
  )

  const content = <Form layout='horizontal'>
    <Form.Item
      name='layer3DefaultAccess'
      label={<div style={{ textAlign: 'left' }}>
        <div>{$t({ defaultMessage: 'Default Access' })}</div>
        <span>{$t({ defaultMessage: 'Applies if no rule is matched' })}</span>
      </div>}
    >
      <div style={{ width: '100%' }}>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'layer3', 'defaultAccess'], 'ALLOW')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: defaultAccessStatus === 'ALLOW' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Allow Traffic' })}
          </span>
        </Button>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'layer3', 'defaultAccess'], 'BLOCK')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: defaultAccessStatus === 'BLOCK' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Block Traffic' })}
          </span>
        </Button>
      </div>
    </Form.Item>
    <Form.Item
      name='layer3Rule'
      label={$t({ defaultMessage: 'Layer 3 Rules' }) + ` (${layer3RuleList.length})`}
    />
    <Table
      columns={basicColumns}
      dataSource={layer3RuleList as Layer3Rule[]}
      rowKey='id'
      actions={actions}
      rowActions={rowActions}
      rowSelection={{ type: 'radio' }}
    />
  </Form>

  const ruleContent = <Form layout='horizontal' form={drawerForm}>
    <Form.Item
      name='description'
      label={$t({ defaultMessage: 'Description' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      initialValue={''}
      validateFirst
      rules={[
        { max: 64 }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a short description, up to 64 characters' })}
      />}
    />
    <Form.Item
      name='layer3Access'
      label={$t({ defaultMessage: 'Access' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
    >
      <div style={{ width: '100%' }}>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'layer3', 'access'], 'ALLOW')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: accessStatus === 'ALLOW' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Allow Traffic' })}
          </span>
        </Button>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'layer3', 'access'], 'BLOCK')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: accessStatus === 'BLOCK' ? '#dff0f9' : '#fff'
          }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>
            {$t({ defaultMessage: 'Block Traffic' })}
          </span>
        </Button>
      </div>
    </Form.Item>
    <Form.Item
      name='protocol'
      label={$t({ defaultMessage: 'Protocol' })}
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      initialValue={'ANYPROTOCOL'}
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
            <Radio value={1}>
              {$t({ defaultMessage: 'Any IP Address' })}
            </Radio>
          </GridCol>

          <GridCol col={{ span: 5 }}>
            <Radio value={2}>
              {$t({ defaultMessage: 'Subnet Network Address' })}
            </Radio>
          </GridCol>
          <GridCol col={{ span: 19 }}>
            {sourceValue === 2
              ? <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Form.Item
                  style={{ width: '48%' }}
                  name='sourceNetworkAddress'
                  rules={[
                    { required: true },
                    { validator: (_, value) => macAddressRegExp(value) }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Network Address' })}/>
                </Form.Item>
                <Form.Item
                  style={{ width: '48%' }}
                  name='sourceMask'
                  rules={[
                    { required: true },
                    { validator: (_, value) => subnetMaskIpRegExp(value) }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Mask' })}/>
                </Form.Item>
              </div> : null}
          </GridCol>

          <GridCol col={{ span: 5 }}>
            <Radio value={3}>
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
              <Input />
            </Form.Item> : null}
          </GridCol>
        </GridRow>

      </Radio.Group>
      <Form.Item
        name='sourcePort'
        label={$t({ defaultMessage: 'Port' })}
        labelAlign={'left'}
        labelCol={{ span: 5 }}
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
            <Radio value={1}>
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
              ? <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Form.Item
                  style={{ width: '48%' }}
                  name='destNetworkAddress'
                  rules={[
                    { required: true, message: 'You must specify subnet network' }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Network Address' })}/>
                </Form.Item>
                <Form.Item
                  style={{ width: '48%' }}
                  name='destMask'
                  rules={[
                    { required: true, message: 'You must specify mask' }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Mask' })}/>
                </Form.Item>
              </div> : null}
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
                { required: true, message: 'You must specify IP Address' }
              ]}
            >
              <Input />
            </Form.Item> : null}
          </GridCol>
        </GridRow>

      </Radio.Group>
      <Form.Item
        name='destPort'
        label={$t({ defaultMessage: 'Port' })}
        labelAlign={'left'}
        labelCol={{ span: 5 }}
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
      <span
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(true)}>
        {$t({ defaultMessage: 'Change' })}
      </span>
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
                form.setFieldValue(['accessControlComponent', 'layer3', 'ruleList'], [
                  ...form.getFieldValue(['accessControlComponent', 'layer3', 'ruleList']),
                  ...layer3RuleList
                ])
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
