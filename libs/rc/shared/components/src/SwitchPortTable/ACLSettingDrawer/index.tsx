import { Key, useState } from 'react'

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
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { Table, TableProps, Modal }                            from '@acx-ui/components'
import { useAddAclMutation }                                   from '@acx-ui/rc/services'
import { Acl, AclExtendedRule, AclStandardRule, checkAclName } from '@acx-ui/rc/utils'
import { useParams }                                           from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                           from '@acx-ui/user'

import { ACLRuleModal } from './ACLRuleModal'

export const defaultStandardRuleList = {
  sequence: 65000,
  action: 'permit',
  source: 'any',
  specificSrcNetwork: ''
}

export const defaultExtendedRuleList = {
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

export interface ACLSettingDrawerProps {
  visible: boolean
  setVisible: (v: boolean) => void
  aclsOptions: DefaultOptionType[]
  setAclsOptions: (v: DefaultOptionType[]) => void
  profileId: string
}

export function ACLSettingDrawer (props: ACLSettingDrawerProps) {
  const { $t } = useIntl()
  const [aclType, setAclType] = useState('standard')
  const { visible, setVisible, aclsOptions, setAclsOptions, profileId } = props
  const [form] = Form.useForm<Acl>()

  const onClose = () => {
    setAclType('standard')
    setVisible(false)
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      form.submit()
      onClose()
    } catch (error) {
      if (error instanceof Error) throw error
    }
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Add ACL' })}
      visible={visible}
      destroyOnClose={true}
      maskClosable={true}
      onCancel={onClose}
      okText={$t({ defaultMessage: 'Save' })}
      onOk={onSave}
      children={
        <ACLSettingForm
          form={form}
          aclType={aclType}
          setAclType={setAclType}
          setVisible={setVisible}
          aclsOptions={aclsOptions}
          setAclsOptions={setAclsOptions}
          profileId={profileId}
        />
      }
      width={aclType === 'standard' ? '500px' : '950px'}
    />
  )
}

interface ACLSettingFormProps {
  form: FormInstance<Acl>
  aclType: string
  setAclType: (v: string) => void
  setVisible: (v: boolean) => void
  aclsOptions: DefaultOptionType[]
  setAclsOptions: (v: DefaultOptionType[]) => void
  profileId: string
}

function ACLSettingForm (props: ACLSettingFormProps) {
  const { $t } = useIntl()
  const params = useParams()
  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<AclStandardRule | AclExtendedRule>()
  const [ruleList, setRuleList] = useState<
    AclStandardRule[] | AclExtendedRule[]
  >([defaultStandardRuleList])
  const { form, aclType, setAclType, setVisible, aclsOptions, setAclsOptions, profileId } = props

  const [addAcl] = useAddAclMutation()

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
  const handleSubmit = async () => {
    const payload = form.getFieldsValue(true)

    try {
      await addAcl({
        params: { tenantId: params.tenantId, profileId: profileId },
        payload
      }).unwrap()
      setAclsOptions([...aclsOptions, { label: payload.name, value: payload.name }])
      setVisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item name='id' initialValue='' noStyle children={<Input type='hidden' />} />
        <Form.Item name='aclRules'
          initialValue={[defaultStandardRuleList]}
          noStyle
          children={<></>}
        />
        <Form.Item
          label={$t({ defaultMessage: 'ACL Name' })}
          name='name'
          data-testid='aclName'
          rules={[
            { required: true },
            { max: 255 },
            { validator: (_, value) => checkAclName(value, form.getFieldValue('aclType')) }
          ]}
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
