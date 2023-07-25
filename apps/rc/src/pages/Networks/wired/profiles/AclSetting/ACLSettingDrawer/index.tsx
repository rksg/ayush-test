import { Key, useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input,
  Radio,
  Button,
  Col,
  Row,
  RadioChangeEvent
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Table, TableProps }                                                     from '@acx-ui/components'
import { Acl, AclExtendedRule, AclStandardRule, checkAclName, validateDuplicateAclName } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                                     from '@acx-ui/user'

import { defaultExtendedRuleList, defaultStandardRuleList } from '..'

import { ACLRuleModal } from './ACLRuleModal'

export interface ACLSettingDrawerProps {
  rule?: Acl
  setRule: (r: Acl) => void
  editMode: boolean
  visible: boolean
  setVisible: (v: boolean) => void
  isRuleUnique?: (r: Acl) => boolean
  aclsTable: Acl[]
}

export function ACLSettingDrawer (props: ACLSettingDrawerProps) {
  const { $t } = useIntl()
  const [aclType, setAclType] = useState('standard')
  const { rule, setRule, visible, setVisible, editMode, aclsTable } = props
  const [form] = Form.useForm<Acl>()

  const onClose = () => {
    setAclType('standard')
    setVisible(false)
  }

  return (
    <Drawer
      title={
        editMode
          ? $t({ defaultMessage: 'Edit ACL' })
          : $t({ defaultMessage: 'Add ACL' })
      }
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <ACLSettingForm
          form={form}
          editMode={editMode}
          rule={rule}
          setRule={setRule}
          aclType={aclType}
          setAclType={setAclType}
          aclsTable={aclsTable}
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
      width={aclType === 'standard' ? '500px' : '950px'}
    />
  )
}

interface ACLSettingFormProps {
  form: FormInstance<Acl>
  editMode: boolean
  rule?: Acl
  setRule: (r: Acl) => void
  aclType: string
  setAclType: (r: string) => void
  aclsTable: Acl[]
}

function ACLSettingForm (props: ACLSettingFormProps) {
  const { $t } = useIntl()
  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<AclStandardRule | AclExtendedRule>()
  const [ruleList, setRuleList] = useState<
    AclStandardRule[] | AclExtendedRule[]
  >([defaultStandardRuleList])
  const { form, editMode, rule, setRule, aclType, setAclType, aclsTable } = props

  useEffect(() => {
    if(rule){
      form.setFieldsValue(rule)
      setAclType(rule.aclType)
      setRuleList(rule.aclRules as AclStandardRule[] | AclExtendedRule[])
    }
  }, [form, rule])

  const columns: TableProps<AclStandardRule | AclExtendedRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Sequence #' }),
      dataIndex: 'sequence',
      key: 'sequence',
      width: 100
    },
    {
      title: $t({ defaultMessage: 'Action' }),
      dataIndex: 'action',
      key: 'action',
      width: 10
    },
    ...(aclType === 'extended'
      ? [
        {
          title: $t({ defaultMessage: 'Protocol' }),
          dataIndex: 'protocol',
          key: 'protocol',
          width: 100
        }
      ]
      : []),
    {
      title: $t({ defaultMessage: 'Source Network' }),
      dataIndex: 'source',
      key: 'source',
      width: 150
    },
    ...(aclType === 'extended'
      ? [
        {
          title: $t({ defaultMessage: 'Destination Network' }),
          dataIndex: 'destination',
          key: 'destination',
          width: 180
        },
        {
          title: $t({ defaultMessage: 'Source Port' }),
          dataIndex: 'sourcePort',
          key: 'sourcePort',
          width: 110
        },
        {
          title: $t({ defaultMessage: 'Destination Port' }),
          dataIndex: 'destinationPort',
          key: 'destinationPort',
          width: 100
        }
      ]
      : [])
  ]

  const rowActions: TableProps<AclExtendedRule>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected({
          ...selectedRows[0],
          source: selectedRows[0].source === 'any' ? 'any' : 'specific',
          specificSrcNetwork: selectedRows[0].source === 'any' ? '' : selectedRows[0].source,
          ...(aclType === 'extended' &&
            { destination: selectedRows[0].destination === 'any' ? 'any' : 'specific',
              specificDestNetwork: selectedRows[0].destination === 'any' ?
                '' : selectedRows[0].destination
            })
        })
        setOpenModal(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows) => {
        const rules = ruleList?.filter((option: { sequence: number }) => {
          return !selectedRows
            .map((r) => r.sequence)
            .includes(option.sequence)
        })
        setRuleList(rules)
        form.setFieldValue('aclRules', rules)
        setSelected(undefined)
      }
    }
  ]

  const onSaveRule = (values: AclExtendedRule) => {
    const newList = ruleList || []
    if (values.source === 'specific') {
      values.source = values.specificSrcNetwork
    }
    values.specificSrcNetwork = ''

    if (values.destination === 'specific') {
      values.destination = values.specificDestNetwork
    }
    values.specificDestNetwork = ''

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
      form.setFieldValue('aclRules', [defaultStandardRuleList])
    } else {
      setRuleList([defaultExtendedRuleList])
      form.setFieldValue('aclRules', [defaultExtendedRuleList])
    }
    setAclType(e.target.value)
    form.validateFields()
  }

  return (
    <>
      <Form
        layout='vertical'
        form={form}
        onFinish={(data: Acl) => {
          setRule(data)
          form.resetFields()
        }}
      >
        <Form.Item name='id' initialValue='' noStyle children={<Input type='hidden' />} />
        <Form.Item
          name='aclRules'
          hidden={true}
          initialValue={[defaultStandardRuleList]}
          children={<Input />}
        />
        <Form.Item
          label={$t({ defaultMessage: 'ACL Name' })}
          name='name'
          rules={[
            { required: true },
            { validator: (_, value) => checkAclName(value, form.getFieldValue('aclType')) },
            { validator: (_, value) => editMode ?
              validateDuplicateAclName(value, aclsTable.filter(item => item.aclRules === value)) :
              validateDuplicateAclName(value, aclsTable) }
          ]}
          children={<Input style={{ width: '400px' }} disabled={editMode}/>}
        />
        <Form.Item
          name='aclType'
          label={$t({ defaultMessage: 'Type' })}
          initialValue={'standard'}
          children={
            <Radio.Group onChange={onAclTypeChange} disabled={editMode}>
              <Radio value={'standard'} data-testid='aclStandard'>
                {$t({ defaultMessage: 'Standard' })}
              </Radio>
              <Radio value={'extended'} data-testid='aclExtended'>
                {$t({ defaultMessage: 'Extended' })}
              </Radio>
            </Radio.Group>
          }
        />
      </Form>
      <Row justify='space-between' style={{ margin: '25px 0 10px' }}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {$t({ defaultMessage: 'Rules' })}
          </label>
        </Col>
        <Col>
          <Button
            type='link'
            onClick={() => {
              setSelected(undefined)
              setOpenModal(true)
            }}
          >
            {$t({ defaultMessage: 'Add Rule' })}
          </Button>
        </Col>
      </Row>
      <Table
        rowKey='sequence'
        rowActions={filterByAccess(rowActions)}
        columns={columns}
        rowSelection={hasAccess() && {
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
      <ACLRuleModal
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
