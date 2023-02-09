import { Key, useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input,
  Button,
  Col,
  Row,
  RadioChangeEvent,
  Select,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Table, TableProps }              from '@acx-ui/components'
import { AclExtendedRule, AclStandardRule, Vlan } from '@acx-ui/rc/utils'

import { defaultExtendedRuleList, defaultStandardRuleList } from '../../AclSetting'

import * as UI            from './styledComponents'
import { VlanPortsModal } from './VlanPortsSetting/VlanPortsModal'

export interface VlanSettingDrawerProps {
  rule?: Vlan
  setVlan: (r: Vlan) => void
  editMode: boolean
  visible: boolean
  setVisible: (v: boolean) => void
  isRuleUnique?: (r: Vlan) => boolean
  vlansList: Vlan[]
}

export function VlanSettingDrawer (props: VlanSettingDrawerProps) {
  const { $t } = useIntl()
  const [aclType, setAclType] = useState('standard')
  const { rule, setVlan, visible, setVisible, editMode, vlansList } = props
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
          rule={rule}
          setVlan={setVlan}
          aclType={aclType}
          setAclType={setAclType}
          vlansList={vlansList}
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
  rule?: Vlan
  setVlan: (r: Vlan) => void
  aclType: string
  setAclType: (r: string) => void
  vlansList: Vlan[]
}

function VlanSettingForm (props: VlanSettingFormProps) {
  const { $t } = useIntl()
  const { Option } = Select
  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<AclStandardRule | AclExtendedRule>()
  const [ruleList, setRuleList] = useState<
    AclStandardRule[] | AclExtendedRule[]
  >([defaultStandardRuleList])
  const { form, rule, setVlan, aclType, setAclType, vlansList } = props

  useEffect(() => {
    if(rule){
      form.setFieldsValue(rule)
    //   setRuleList(rule.aclRules as AclStandardRule[] | AclExtendedRule[])
    }
  }, [form, rule])

  const columns: TableProps<AclStandardRule | AclExtendedRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'sequence',
      key: 'sequence',
      width: 100
    },
    {
      title: $t({ defaultMessage: 'Untagged Port' }),
      dataIndex: 'action',
      key: 'action',
      width: 180
    },
    {
      title: $t({ defaultMessage: 'Tagged Ports' }),
      dataIndex: 'source',
      key: 'source',
      width: 180
    }
  ]

  const rowActions: TableProps<
    AclStandardRule | AclExtendedRule
  >['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected({
          ...selectedRows[0],
          source: selectedRows[0].source === 'any' ? 'any' : 'specific'
        })
        setOpenModal(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows) => {
        setRuleList(
          ruleList?.filter((option: { sequence: number }) => {
            return !selectedRows
              .map((r) => r.sequence)
              .includes(option.sequence)
          })
        )
        setSelected(undefined)
      }
    }
  ]

  const onSaveRule = (values: AclExtendedRule) => {
    const newList = ruleList || []
    if (values.source === 'specific') {
      values.source = values.specificSrcNetwork
      values.specificSrcNetwork = ''
    }
    if (values.destination === 'specific') {
      values.destination = values.specificDestNetwork
      values.specificDestNetwork = ''
    }
    if (!selected) {
      // Add
      setRuleList([...ruleList, values])
      form.setFieldValue('aclRules', [...ruleList, values])
    } else {
      // edit
      const editedRecord = newList.map((option) => {
        if (selected.sequence === option.sequence) {
          return { ...selected, ...values }
        }
        return option
      })
      setRuleList(editedRecord)
      form.setFieldValue('aclRules', editedRecord)
    }
    setSelected(undefined)
    setOpenModal(false)
  }

  const onAclTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === 'standard') {
      setRuleList([defaultStandardRuleList])
    } else {
      setRuleList([defaultExtendedRuleList])
    }
    setAclType(e.target.value)
    form.validateFields()
  }

  return (
    <>
      <Form
        layout='vertical'
        form={form}
        onFinish={(data: Vlan) => {
          setVlan(data)
          form.resetFields()
        }}
      >
        <Form.Item name='id' initialValue='' noStyle children={<Input type='hidden' />} />
        <Form.Item
          label={$t({ defaultMessage: 'VLAN ID' })}
          name='vlanId'
          rules={[
            { required: true }
          ]}
          children={<Input style={{ width: '400px' }} />}
        />
        <Form.Item
          name='vlanName'
          label={$t({ defaultMessage: 'VLAN Name' })}
          rules={[
            { required: true }
          ]}
          children={<Input style={{ width: '400px' }} />}
        />
        <UI.FieldLabel width='130px'>
          { $t({ defaultMessage: 'IPv4 DHCP Snooping' }) }
          <Form.Item
            name={'ipv4DhcpSnooping'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>
        <UI.FieldLabel width='130px'>
          { $t({ defaultMessage: 'ARP Inspection' }) }
          <Form.Item
            name={'arpInspection'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </UI.FieldLabel>
        <Form.Item
          name='igmpSnooping'
          label={$t({ defaultMessage: 'IGMP Snooping' })}
          initialValue={'none'}
          children={
            <Select>
              <Option value={'active'}>
                {$t({ defaultMessage: 'Active' })}</Option>
              <Option value={'Passive'}>
                {$t({ defaultMessage: 'Passive' })}</Option>
              <Option value={'none'}>
                {$t({ defaultMessage: 'NONE' })}</Option>
            </Select>
          }
        />
        <Form.Item
          name='multicastVersion'
          label={$t({ defaultMessage: 'Multicast Version' })}
          initialValue={2}
          children={
            <Select>
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
          initialValue={'stp'}
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
        rowKey='sequence'
        rowActions={rowActions}
        columns={columns}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selected ? [selected.sequence] : [],
          onChange: (keys: React.Key[]) => {
            setSelected(
              ruleList?.find((i: { sequence: Key }) => i.sequence === keys[0])
            )
          }
        }}
        dataSource={ruleList || undefined}
      />
      <VlanPortsModal
        open={openModal}
        aclType={aclType}
        editRecord={selected}
        currrentRecords={ruleList}
        onCancel={() => setOpenModal(false)}
        onSave={onSaveRule}
      />
    </>
  )
}
