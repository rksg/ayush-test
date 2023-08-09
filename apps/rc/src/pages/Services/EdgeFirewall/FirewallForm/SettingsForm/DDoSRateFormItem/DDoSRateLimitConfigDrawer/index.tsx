import { useEffect, useState } from 'react'

import { Form, Space } from 'antd'
import _               from 'lodash'
import { useIntl }     from 'react-intl'

import { cssNumber, Drawer, showActionModal, TableProps, useStepFormContext } from '@acx-ui/components'
import { DDoSRulesTable as DefaultDDoSRulesTable }                            from '@acx-ui/rc/components'
import { DdosRateLimitingRule, getDDoSAttackTypeString }                      from '@acx-ui/rc/utils'
import { filterByAccess }                                                     from '@acx-ui/user'

import { FirewallFormModel } from '../../..'
import { DDoSRuleDialog }    from '../DDoSRuleDialog'

interface DDoSRateLimitRulesTableProps {
  data?: DdosRateLimitingRule[]
}

export const DDoSRateLimitRulesTable = (props: DDoSRateLimitRulesTableProps) => {
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
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t(
              { defaultMessage: '{count, plural, one {Rule} other {Rules}}' },
              { count: rows.length }
            ),
            entityValue: rows.length === 1
              ? getDDoSAttackTypeString($t, rows[0].ddosAttackType)
              : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            const currentData = ([] as DdosRateLimitingRule[]).concat(form.getFieldValue('rules'))
            rows.forEach((item) => {
              _.remove(currentData, item)
            })

            clearSelection()
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
      <DefaultDDoSRulesTable
        dataSource={data}
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'checkbox' }}
        actions={actions}
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
  data?: DdosRateLimitingRule[]
}

export const DDoSRateLimitConfigDrawer = (props: DDoSRateLimitConfigDrawerProps) => {
  const { visible, setVisible, data } = props
  const { $t } = useIntl()
  const { form: parentForm } = useStepFormContext<FirewallFormModel>()
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
    const oriData = parentForm.getFieldValue('ddosRateLimitingRules') ?? []

    if (oriData.length === 0)
      parentForm.setFieldValue('ddosRateLimitingEnabled', false)

    onClose()
  }

  useEffect(() => {
    if (visible && data)
      form.setFieldValue('rules', data)
  }, [form, data, visible])

  const footer = <Drawer.FormFooter
    buttonLabel={{ save: $t({ defaultMessage: 'Apply' }) }}
    onCancel={handleCancel}
    onSave={async () => form.submit()}
  />

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
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please create 1 rule at least.' })
                }]}
                valuePropName='data'
                initialValue={[] as DdosRateLimitingRule[]}
              >
                <DDoSRateLimitRulesTable />
              </Form.Item>
            }}
          </Form.Item>
        </Space>
      </Form>
    </Drawer>
  )
}