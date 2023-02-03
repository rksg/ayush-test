import { Key, useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input,
  Radio,
  Button,
  Col,
  Row,
  RadioChangeEvent,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Subtitle, Table, TableProps }   from '@acx-ui/components'
import { Acl, AclExtendedRule, AclStandardRule } from '@acx-ui/rc/utils'

import { ACLRuleModal } from './ACLRuleModal'

export interface ACLSettingDrawerProps {
  rule?: Acl;
  setRule: (r: Acl) => void;
  editMode: boolean;
  visible: boolean;
  setVisible: (v: boolean) => void;
  isRuleUnique?: (r: Acl) => boolean;
}

export function ACLSettingDrawer (props: ACLSettingDrawerProps) {
  const { $t } = useIntl()
  const [aclType, setAclType] = useState('standard')
  const { rule, setRule, visible, setVisible, editMode } = props
  const [form] = Form.useForm<Acl>()

  const onClose = () => {
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
        <ForwardingRuleForm
          form={form}
          rule={rule}
          setRule={setRule}
          aclType={aclType}
          setAclType={setAclType}
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

interface ForwardingRuleFormProps {
  form: FormInstance<Acl>;
  rule?: Acl;
  setRule: (r: Acl) => void;
  aclType: string;
  setAclType: (r: string) => void;
}

const defaultStandardRuleList = {
  sequence: 65000,
  action: 'permit',
  source: 'any',
  specificSrcNetwork: ''
}

const defaultExtendedRuleList = {
  sequence: 65000,
  action: 'permit',
  source: 'any',
  specificSrcNetwork: '',
  protocol: 'ip',
  sourcePort: '',
  destination: 'any',
  destinationPort: '',
  specificDestNetwork: ''
}

function ForwardingRuleForm (props: ForwardingRuleFormProps) {
  const { $t } = useIntl()
  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<AclStandardRule | AclExtendedRule>()
  const [ruleList, setRuleList] = useState<
    AclStandardRule[] | AclExtendedRule[]
  >([defaultStandardRuleList])
  const { form, rule = {}, setRule, aclType, setAclType } = props

  useEffect(() => {
    form.setFieldsValue(rule)
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

  const onSaveRule = (values: AclStandardRule | AclExtendedRule) => {
    const newList = ruleList || []
    if (values.source === 'specific') {
      values.source = values.specificSrcNetwork
    }
    if (!selected) {
      // Add
      setRuleList([...ruleList, values])
    } else {
      // edit
      setRuleList(
        newList.map((option) => {
          if (selected.sequence === option.sequence) {
            return { ...selected, ...values }
          }
          return option
        })
      )
    }
    setSelected(undefined)
    setOpenModal(false)
  }

  const onAclTypeChange = (e: RadioChangeEvent) => {
    console.log(e.target.value)
    if (e.target.value === 'standard') {
      setRuleList([defaultStandardRuleList])
    } else {
      setRuleList([defaultExtendedRuleList])
    }
    setAclType(e.target.value)
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
        <Form.Item name='id' noStyle children={<Input type='hidden' />} />
        <Form.Item
          label={$t({ defaultMessage: 'ACL Name' })}
          name='name'
          rules={[{ required: true }]}
          children={<Input style={{ width: '400px' }} />}
        />
        <Form.Item
          name='aclType'
          label={$t({ defaultMessage: 'Type' })}
          initialValue={'standard'}
          children={
            <Radio.Group onChange={onAclTypeChange}>
              <Radio value={'standard'}>
                {$t({ defaultMessage: 'Standard' })}
              </Radio>
              <Radio value={'extended'}>
                {$t({ defaultMessage: 'Extended' })}
              </Radio>
            </Radio.Group>
          }
        />
      </Form>
      <Row justify='space-between' style={{ margin: '25px 0 10px' }}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>Rules</label>
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
