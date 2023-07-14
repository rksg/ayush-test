import { Key, useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input,
  Button,
  Col,
  Row,
  Select,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  SwitchModel,
  SwitchModelPortData,
  validateDuplicateVlanId,
  validateVlanName,
  validateVlanNameWithoutDVlans,
  Vlan
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'


import * as UI            from './styledComponents'
import { VlanPortsModal } from './VlanPortsSetting/VlanPortsModal'

export interface VlanSettingDrawerProps {
  vlan?: Vlan
  setVlan: (r: Vlan) => void
  editMode: boolean
  visible: boolean
  setVisible: (v: boolean) => void
  vlansList: Vlan[]
}

export function VlanSettingDrawer (props: VlanSettingDrawerProps) {
  const { $t } = useIntl()
  const { vlan, setVlan, visible, setVisible, editMode, vlansList } = props
  const [form] = Form.useForm<Vlan>()

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={
        editMode
          ? $t({ defaultMessage: 'Edit VLAN' })
          : $t({ defaultMessage: 'Add VLAN' })
      }
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <VlanSettingForm
          form={form}
          editMode={editMode}
          vlan={vlan}
          setVlan={setVlan}
          vlansList={vlansList || []}
        />
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: editMode
              ? $t({ defaultMessage: 'Save' })
              : $t({ defaultMessage: 'Add' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
              onClose()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      width={'600px'}
    />
  )
}

interface VlanSettingFormProps {
  form: FormInstance<Vlan>
  editMode: boolean
  vlan?: Vlan
  setVlan: (r: Vlan) => void
  vlansList: Vlan[]
}

function VlanSettingForm (props: VlanSettingFormProps) {
  const { $t } = useIntl()
  const { Option } = Select
  const [openModal, setOpenModal] = useState(false)
  const [ipv4DhcpSnooping, setIpv4DhcpSnooping] = useState(false)
  const [arpInspection, setArpInspection] = useState(false)
  const [multicastVersionDisabled, setMulticastVersionDisabled] = useState(true)
  const [selected, setSelected] = useState<SwitchModelPortData>()
  const [ruleList, setRuleList] = useState<SwitchModelPortData[]>([])
  const { form, vlan, setVlan, vlansList } = props

  useEffect(() => {
    if(vlan){
      form.resetFields()
      form.setFieldsValue(vlan)
      const vlanPortsData = vlan.switchFamilyModels?.map(item => {
        return {
          id: item.id,
          model: item.model,
          slots: item.slots,
          untaggedPorts: item.untaggedPorts && item.untaggedPorts?.toString().split(','),
          taggedPorts: item.taggedPorts && item.taggedPorts?.toString().split(',')
        }
      }) as unknown
      setRuleList(vlanPortsData as SwitchModelPortData[])
      setArpInspection(vlan.arpInspection || false)
      setIpv4DhcpSnooping(vlan.ipv4DhcpSnooping || false)
    }
  }, [form, vlan])

  const columns: TableProps<SwitchModelPortData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      key: 'model',
      width: 100
    },
    {
      title: $t({ defaultMessage: 'Untagged Port' }),
      dataIndex: 'untaggedPorts',
      key: 'untaggedPorts',
      width: 180,
      render: (data) => {
        const untaggedPorts = data?.toString() === '' ? '-' :
          data?.toString().replace('false', '-').substring(0, 20)
        return untaggedPorts + (untaggedPorts?.length === 20 ? '...' : '')
      }
    },
    {
      title: $t({ defaultMessage: 'Tagged Ports' }),
      dataIndex: 'taggedPorts',
      key: 'taggedPorts',
      width: 180,
      render: (data) => {
        const taggedPorts = data?.toString() === '' ? '-' :
          data?.toString().replace('false', '-').substring(0, 20)
        return taggedPorts + (taggedPorts?.length === 20 ? '...' : '')
      }
    }
  ]

  const rowActions: TableProps<SwitchModelPortData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected({
          ...selectedRows[0]
        })
        setOpenModal(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Model' }),
            entityValue: selectedRows[0].model
          },
          onOk: () => {
            setRuleList(
              ruleList?.filter((option: { model: string }) => {
                return !selectedRows
                  .map((r) => r.model)
                  .includes(option.model)
              })
            )
            setSelected(undefined)
            clearSelection()
          }
        })
      }
    }
  ]

  const onIGMPChange = (value: string) => {
    if(value === 'active' || value === 'passive'){
      setMulticastVersionDisabled(false)
      form.setFieldValue('multicastVersion', 2)
    }else{
      setMulticastVersionDisabled(true)
      form.resetFields(['multicastVersion'])
    }
  }

  const onCancel = () => {
    setSelected(undefined)
    setOpenModal(false)
  }

  const onSaveVlan = (values: SwitchModelPortData) => {
    const tmpRuleList = ruleList ?
      ruleList.filter(item => item.model !== values.model):
      ruleList || []
    const mergedRuleList = [
      ...tmpRuleList,
      values
    ]
    setRuleList(mergedRuleList)
    setSelected(undefined)
    setOpenModal(false)
  }

  return (
    <div data-testid='addVlanDrawer'>
      <Form
        layout='vertical'
        form={form}
        onFinish={(data: Vlan) => {
          setVlan({
            ...data,
            switchFamilyModels: ruleList as unknown as SwitchModel[] || []
          })
          form.resetFields()
        }}
      >
        <Form.Item
          label={$t({ defaultMessage: 'VLAN ID' })}
          name='vlanId'
          validateFirst
          rules={[
            { required: true },
            { validator: (_, value) => validateVlanName(value) },
            { validator: (_, value) => validateDuplicateVlanId(value, vlansList) }
          ]}
          children={<Input style={{ width: '400px' }} />}
        />
        <Form.Item
          name='vlanName'
          label={$t({ defaultMessage: 'VLAN Name' })}
          initialValue={''}
          rules={[
            { validator: (_, value) => validateVlanNameWithoutDVlans(value) }
          ]}
          children={<Input style={{ width: '400px' }} maxLength={32} />}
        />
        <UI.FieldLabel width='130px'>
          { $t({ defaultMessage: 'IPv4 DHCP Snooping' }) }
          <Form.Item
            name={'ipv4DhcpSnooping'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch onChange={setIpv4DhcpSnooping} data-testid='dhcpSnooping' />}
          />
        </UI.FieldLabel>
        <UI.FieldLabel width='500px' style={{ marginTop: '-10px', paddingBottom: '10px' }}>
          {ipv4DhcpSnooping &&
            <label>{
              $t({ defaultMessage:
                'If DHCP Snooping is turned ON, you must select trusted ports' }) }
            </label>}
        </UI.FieldLabel>
        <UI.FieldLabel width='130px'>
          { $t({ defaultMessage: 'ARP Inspection' }) }
          <Form.Item
            name={'arpInspection'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch onChange={setArpInspection} data-testid='arpInspection' />}
          />
        </UI.FieldLabel>
        <UI.FieldLabel width='500px' style={{ marginTop: '-10px', paddingBottom: '10px' }}>
          {arpInspection &&
            <label>{
              $t({ defaultMessage:
                'If ARP Inspection is turned ON, you must select trusted ports' }) }
            </label>}
        </UI.FieldLabel>
        <Form.Item
          name='igmpSnooping'
          label={$t({ defaultMessage: 'IGMP Snooping' })}
          initialValue={'none'}
          children={
            <Select onChange={onIGMPChange}>
              <Option value={'active'}>
                {$t({ defaultMessage: 'Active' })}</Option>
              <Option value={'passive'}>
                {$t({ defaultMessage: 'Passive' })}</Option>
              <Option value={'none'}>
                {$t({ defaultMessage: 'NONE' })}</Option>
            </Select>
          }
        />
        <Form.Item
          name='multicastVersion'
          label={$t({ defaultMessage: 'Multicast Version' })}
          initialValue={null}
          children={
            <Select disabled={multicastVersionDisabled}>
              <Option value={2}>
                {$t({ defaultMessage: 'Version 2' })}</Option>
              <Option value={3}>
                {$t({ defaultMessage: 'Version 3' })}</Option>
            </Select>
          }
        />
        <Form.Item
          name='spanningTreeProtocol'
          label={$t({ defaultMessage: 'Spanning tree protocol' })}
          initialValue={'none'}
          children={
            <Select>
              <Option value={'rstp'}>
                {$t({ defaultMessage: 'RSTP' })}</Option>
              <Option value={'stp'}>
                {$t({ defaultMessage: 'STP' })}</Option>
              <Option value={'none'}>
                {$t({ defaultMessage: 'NONE' })}</Option>
            </Select>
          }
        />
        <Form.Item name='ports' initialValue={0} noStyle children={<Input type='hidden' />}/>
        <Form.Item name='title' initialValue={''} noStyle children={<Input type='hidden' />}/>
        <Form.Item
          name='vlanConfigName'
          initialValue={''}
          noStyle
          children={<Input type='hidden' />}
        />
      </Form>
      <Row justify='space-between' style={{ margin: '25px 0 10px' }}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>Ports</label>
        </Col>
        <Col>
          <Button
            type='link'
            onClick={() => {
              setSelected(undefined)
              setOpenModal(true)
            }}
          >
            {$t({ defaultMessage: 'Add Model' })}
          </Button>
        </Col>
      </Row>
      <Table
        rowKey='model'
        rowActions={filterByAccess(rowActions)}
        columns={columns}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selected ? [selected.model] : [],
          onChange: (keys: React.Key[]) => {
            setSelected(
              ruleList?.find((i: { model: Key }) => i.model === keys[0])
            )
          }
        }}
        dataSource={ruleList || undefined}
      />
      <VlanPortsModal
        open={openModal}
        editRecord={selected}
        currrentRecords={ruleList}
        onCancel={onCancel}
        onSave={onSaveVlan}
        vlanList={vlansList}
      />
    </div>
  )
}
