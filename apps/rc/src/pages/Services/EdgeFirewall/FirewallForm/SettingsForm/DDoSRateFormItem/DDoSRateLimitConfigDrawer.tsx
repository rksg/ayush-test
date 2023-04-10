import { useEffect, useState } from 'react'

import { Empty, Form, Space } from 'antd'
import _                      from 'lodash'
import { useIntl }            from 'react-intl'

import { cssNumber, Drawer, showActionModal, Table, TableProps, useStepFormContext } from '@acx-ui/components'
import { DdosRateLimitingRule }                                                      from '@acx-ui/rc/utils'
import { filterByAccess }                                                            from '@acx-ui/user'

import { FirewallForm } from '../..'

import { DDoSRuleDialog } from './DDoSRuleDialog'

interface DDoDRateLimitRulesTableProps {
  data?: DdosRateLimitingRule[]
}

const DDoDRateLimitRulesTable = (props: DDoDRateLimitRulesTableProps) => {
  const { $t } = useIntl()
  const { data } = props
  const form = Form.useFormInstance()
  const [dialogVisible, setDialogVisible] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [editData, setEditData] = useState<DdosRateLimitingRule>({} as DdosRateLimitingRule)
  const onChangeDialogVisible = (checked: boolean) => {
    setDialogVisible(checked)
  }

  const handleDDoSRuleSubmit = (newData: DdosRateLimitingRule, isEdit: boolean) => {
    const currentData = ([] as DdosRateLimitingRule[]).concat(form.getFieldValue('rules'))

    if (isEdit) {
      const targetIdx = _.findIndex(currentData, { ddosAttackType: newData.ddosAttackType })
      if (targetIdx > -1)
        currentData[targetIdx] = newData
    } else {
      currentData.push(newData)
    }

    form.setFieldValue('rules', currentData)
  }

  const columns: TableProps<DdosRateLimitingRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'DDoS Attack Type' }),
      key: 'ddosAttackType',
      dataIndex: 'ddosAttackType',
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Rate-limit Value' }),
      key: 'rateLimiting',
      dataIndex: 'rateLimiting'
    }
  ]

  const rowActions: TableProps<DdosRateLimitingRule>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setEditMode(true)
        setEditData(selectedRows[0] as DdosRateLimitingRule)
        onChangeDialogVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Rules' }),
            entityValue: rows.length === 1 ? rows[0].ddosAttackType : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            const currentData = ([] as DdosRateLimitingRule[]).concat(form.getFieldValue('rules'))
            rows.forEach((item) => {
              currentData.splice(_.findIndex(currentData, item.ddosAttackType), 1)
            })

            form.setFieldValue('rules', currentData)
          }
        })
      }
    }
  ]

  const actions: TableProps<DdosRateLimitingRule>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Rule' }),
      onClick: () => {
        setEditMode(false)
        setEditData({} as DdosRateLimitingRule)
        onChangeDialogVisible(true)
      }
    }
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey='ddosAttackType'
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'checkbox' }}
        actions={actions}
        locale={{
          emptyText: <Empty description={$t({ defaultMessage: 'No rules created yet' })} />
        }}
      />

      <DDoSRuleDialog
        visible={dialogVisible}
        setVisible={onChangeDialogVisible}
        onSubmit={handleDDoSRuleSubmit}
        editMode={editMode}
        editData={editData}
      />
    </>
  )
}

interface DDoSRateLimitConfigDrawerProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const DDoSRateLimitConfigDrawer = (props: DDoSRateLimitConfigDrawerProps) => {
  const { visible, setVisible } = props
  const { $t } = useIntl()
  const { form: parentForm } = useStepFormContext<FirewallForm>()
  const ddosRateLimitingRules = Form.useWatch('ddosRateLimitingRules', parentForm)
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
  }

  const handleSubmit = async () => {
    const newData = form.getFieldValue('rules')
    parentForm.setFieldValue('ddosRateLimitingRules', newData)
    onClose()
  }

  const handleCancel = () => {
    const newData = form.getFieldValue('rules') ?? []

    if (newData.length === 0)
      parentForm.setFieldValue('ddosRateLimitingEnabled', false)
    onClose()
  }

  useEffect(() => {
    form.setFieldValue('rules', ddosRateLimitingRules)
  }, [form, ddosRateLimitingRules])

  const footer = [
    <Drawer.FormFooter
      key='ddosDrawer'
      buttonLabel={{ save: $t({ defaultMessage: 'Apply' }) }}
      onCancel={handleCancel}
      onSave={async () => form.submit()}
    />
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: 'DDoS Rate-limiting Settings' })}
      visible={visible}
      footer={footer}
      destroyOnClose
      width='30%'
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
      >
        <Space
          direction='vertical'
          size={cssNumber('--acx-content-vertical-space')}
          style={{ width: '100%' }}
        >
          <Form.Item
            shouldUpdate={(prevValues, currentValues) => {
              return prevValues.rules !== currentValues.rules
            }}
          >
            {({ getFieldValue }) => {
              const rules = getFieldValue('rules')

              return <Form.Item
                name='rules'
                label={$t({ defaultMessage: 'Rules({ruleCount})' },
                  { ruleCount: rules?.length ?? 0 })}
                rules={[{ required: true }]}
                valuePropName='data'
                initialValue={[] as DdosRateLimitingRule[]}
              >
                <DDoDRateLimitRulesTable />
              </Form.Item>
            }}
          </Form.Item>
        </Space>
      </Form>
    </Drawer>
  )
}