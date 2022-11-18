import React, { SetStateAction, useRef, useState } from 'react'

import { Form, Input, InputNumber, Radio, RadioChangeEvent, Select, Space } from 'antd'
import { useIntl }                                                          from 'react-intl'

import { Button, Drawer, Fieldset, GridCol, GridRow, showToast, Table, TableProps } from '@acx-ui/components'
import { DownloadOutlined }                                                         from '@acx-ui/icons'

const { useWatch } = Form

interface Layer3Rule {
  id: number,
  description: string,
  access: string,
  protocol: string,
  source: {
    type: string,
    port: number
  },
  destination: {
    type: string,
    port: number
  }
}


const Layer3Drawer = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(true)
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [layer3RuleList, setLayer3RuleList] = useState([] as Layer3Rule[])
  const [layer3Rule, setLayer3Rule] = useState({} as Layer3Rule)
  const form = Form.useFormInstance()
  const [drawerForm] = Form.useForm()

  console.log(form.getFieldValue('accessControlComponent'))

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
      title: $t({ defaultMessage: 'Access' }),
      dataIndex: 'access',
      key: 'access'
    },
    {
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'source',
      key: 'source'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description'
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

  const onSourceChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value)
    setSourceValue(e.target.value)
    drawerForm.setFieldValue('sourceType', RuleSource[e.target.value - 1])
  }

  const onDestChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value)
    setDestValue(e.target.value)
    drawerForm.setFieldValue('destType', RuleSource[e.target.value - 1])
  }

  const handleAddAction = () => {
    setRuleDrawerVisible(true)
    console.log('handle Add action')
  }

  const handleRuleDrawerClose = () => {
    setRuleDrawerVisible(false)
  }

  const handleLayer3DrawerClose = () => {
    setVisible(false)
  }

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }]

  const selectProtocol = (
    <select
      style={{ width: '100%' }}
      onChange={(evt) => {
        setLayer3Rule({
          ...layer3Rule,
          protocol: evt.target.value
        })
        console.log(form.getFieldValue('protocol'), layer3Rule, evt.target.value)
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
      dataSource={layer3RuleList}
      rowKey='id'
      actions={actions}
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
                    { required: true, message: 'You must specify subnet network' }
                  ]}
                >
                  <Input placeholder={$t({ defaultMessage: 'Network Address' })}/>
                </Form.Item>
                <Form.Item
                  style={{ width: '48%' }}
                  name='sourceMask'
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
            {sourceValue === 3 ? <Form.Item
              name='sourceIp'
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
        onClose={handleLayer3DrawerClose}
        // destroyOnClose={true}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleLayer3DrawerClose}
            onSave={async (addAnotherRuleChecked: boolean) => {
              try {
                console.log('on save event', addAnotherRuleChecked)
                console.log(form.getFieldValue('accessControlComponent'))
                form.setFieldValue(['accessControlComponent', 'layer3', 'ruleList'], [
                  ...form.getFieldValue(['accessControlComponent', 'layer3', 'ruleList']),
                  {
                    description: form.getFieldValue('description')
                  }
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
        title={$t({ defaultMessage: 'Add Layer 3 Rule' })}
        visible={ruleDrawerVisible}
        onClose={handleRuleDrawerClose}
        destroyOnClose={true}
        children={ruleContent}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleRuleDrawerClose}
            onSave={async (addAnotherRuleChecked: boolean) => {
              try {
                await drawerForm.validateFields()

                console.log('on save event', addAnotherRuleChecked)
                console.log(form.getFieldValue('description'))
                console.log(drawerForm.getFieldValue('description'))
                console.log(drawerForm.getFieldValue('access'))
                console.log(drawerForm.getFieldValue('protocol'))
                console.log(drawerForm.getFieldValue('sourceNetworkAddress'))
                console.log(drawerForm.getFieldValue('sourceMask'))
                console.log(drawerForm.getFieldValue('sourceIp'))
                console.log(drawerForm.getFieldValue('sourcePort'))
                console.log(drawerForm.getFieldValue('destNetworkAddress'))
                console.log(drawerForm.getFieldValue('destMask'))
                console.log(drawerForm.getFieldValue('destIp'))
                console.log(drawerForm.getFieldValue('destPort'))
                //   setMacAddressList([...macAddressList, ...addressTags.map(tag => {
                //     return {
                //       macAddress: tag
                //     }
                //   })])
                //   handleRuleDrawerClose()
                // }
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
