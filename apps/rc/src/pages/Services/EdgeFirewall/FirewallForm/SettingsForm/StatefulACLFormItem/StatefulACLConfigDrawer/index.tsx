import { useCallback, useEffect, useMemo, useState } from 'react'

import { Form, Input, RowProps, Select, Space } from 'antd'
import TextArea                                 from 'antd/lib/input/TextArea'
import _                                        from 'lodash'
import { useIntl }                              from 'react-intl'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortableElementProps,
  SortableContainerProps
} from 'react-sortable-hoc'

import {
  cssNumber,
  Drawer,
  showActionModal,
  TableProps,
  useStepFormContext
} from '@acx-ui/components'
import {
  StatefulACLRulesTable as DefaultStatefulACLRulesTable,
  useDefaultStatefulACLRulesColumns
} from '@acx-ui/rc/components'
import {
  ACLDirection,
  getACLDirectionOptions,
  StatefulAcl,
  StatefulAclRule
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { FirewallFormModel }     from '../../..'
import { StatefulACLRuleDialog } from '../StatefulACLRuleDialog'

import { InboundDefaultRules, OutboundDefaultRules } from './defaultRules'
import { DragIcon, DragIconWrapper }                 from './styledComponents'

// @ts-ignore
const SortableItem = SortableElement((props: SortableElementProps) => <tr {...props} />)
// @ts-ignore
const SortContainer = SortableContainer((props: SortableContainerProps) => <tbody {...props} />)

const adjustPriority = (data: StatefulAclRule[]) => {
  // re-assign priority
  data.forEach((item, index) => {
    item.priority = index + 1
  })
}

interface StatefulACLRulesTableProps {
  data?: StatefulAclRule[]
}

interface ACLDraggableTableRowProps extends RowProps {
  'data-row-key': string;
}
const StatefulACLRulesTable = (props: StatefulACLRulesTableProps) => {
  const { $t } = useIntl()
  const { data } = props
  const form = Form.useFormInstance()
  const [dialogVisible, setDialogVisible] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [editData, setEditData] = useState<StatefulAclRule>({} as StatefulAclRule)
  const formData = form.getFieldsValue(true)
  const defaultColumns = useDefaultStatefulACLRulesColumns()

  const onChangeDialogVisible = (checked: boolean) => {
    setDialogVisible(checked)
  }

  const handleStatefulACLRuleSubmit = (newData: StatefulAclRule, isEdit: boolean) => {
    const currentData = ([] as StatefulAclRule[]).concat(form.getFieldValue('rules'))
    if (isEdit) {
      const targetIdx = _.findIndex(currentData, { priority: newData.priority })
      if (targetIdx > -1)
        currentData[targetIdx] = _.merge(currentData[targetIdx], newData)
    } else {
      const lastItem = currentData.pop()
      if (!lastItem) return

      const lastPriority = lastItem.priority ?? (currentData.length + 1)
      newData.priority = lastPriority
      currentData.push(newData)
      lastItem.priority = lastPriority + 1
      currentData.push(lastItem)
    }

    form.setFieldValue('rules', currentData)
  }

  const isDefaultRule = useCallback((rule: StatefulAclRule) => {
    const rulesAmount = formData.rules.length

    // inbound: last rule is the default rule
    // outbound: default rules are No.1 - No.3 and the last one.
    if (rule.priority === rulesAmount) {
      return true
    } else {
      return formData.direction === ACLDirection.INBOUND ? false : Number(rule.priority) <= 3
    }
  }, [formData])

  const onSortEnd = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      if (oldIndex !== newIndex) {
        let tempDataSource = _.cloneDeep(data ?? [])
        let movingItem = tempDataSource.splice(oldIndex, 1)
        tempDataSource.splice(newIndex, 0, movingItem[0])

        // re-assign priority
        adjustPriority(tempDataSource)

        form.setFieldValue('rules', tempDataSource)
      }
    }, [data, form])

  const ACLDraggableContainer = useMemo(() =>
    (props: SortableContainerProps) => {
      return <SortContainer
        useDragHandle
        disableAutoscroll
        onSortEnd={onSortEnd}
        {...props}
      />
    }, [onSortEnd])

  const ACLDraggableTableRow = useMemo(() =>
    (props: ACLDraggableTableRowProps) => {
      if (!data) return null

      const { className, style, ...restProps } = props
      const index = data.findIndex(
        (x) => (x.priority ?? '') === restProps['data-row-key']
      )
      const isDefault = isDefaultRule(data[index] as StatefulAclRule)

      return isDefault
        ? <tr {...props}/>
        : <SortableItem index={index} {...restProps} />
    }, [data, isDefaultRule])

  const DragHandle = SortableHandle(() => <DragIcon />)

  const customColumns: TableProps<StatefulAclRule>['columns'] = [
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      render: (_data, row) => {
        const isDisabled = isDefaultRule(row)
        return <DragIconWrapper
          disabled={isDisabled}
          data-testid={`${row.priority}_Icon`}
        >
          {isDisabled ? <DragIcon /> : <DragHandle />}
        </DragIconWrapper>
      }
    }
  ]

  const columns: TableProps<StatefulAclRule>['columns'] = defaultColumns.concat(customColumns)

  const rowActions: TableProps<StatefulAclRule>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setEditMode(true)
        setEditData(selectedRows[0] as StatefulAclRule)
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
            entityValue: rows.length === 1 ? rows[0].priority+'' : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            const currentData = ([] as StatefulAclRule[]).concat(form.getFieldValue('rules'))
            rows.forEach((item) => {
              _.remove(currentData, { priority: item.priority })
            })

            clearSelection()

            // re-assign priority
            adjustPriority(currentData)

            form.setFieldValue('rules', currentData)
          }
        })
      }
    }
  ]

  const actions: TableProps<StatefulAclRule>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Rule' }),
      onClick: () => {
        setEditMode(false)
        setEditData({} as StatefulAclRule)
        onChangeDialogVisible(true)
      }
    }
  ]

  return (
    <>
      <DefaultStatefulACLRulesTable
        columns={columns}
        dataSource={data ?? [] as StatefulAclRule[]}
        rowActions={filterByAccess(rowActions)}
        rowSelection={{
          type: 'checkbox',
          // eslint-disable-next-line max-len
          renderCell: (_checked, record: StatefulAclRule, _index, originNode) => {
            const isDefault = isDefaultRule(record)
            return isDefault ? '': originNode
          },
          getCheckboxProps: (record: StatefulAclRule) => ({ disabled: isDefaultRule(record) })
        }}
        actions={actions}
        components={{
          body: {
            wrapper: ACLDraggableContainer,
            row: ACLDraggableTableRow
          }
        }}
      />

      <StatefulACLRuleDialog
        visible={dialogVisible}
        setVisible={onChangeDialogVisible}
        onSubmit={handleStatefulACLRuleSubmit}
        editMode={editMode}
        editData={editData}
      />
    </>
  )
}

interface StatefulACLConfigDrawerProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editData: StatefulAcl;
}

export const StatefulACLConfigDrawer = (props: StatefulACLConfigDrawerProps) => {
  const { visible, setVisible, editData } = props
  const { $t } = useIntl()
  const aclDirectionList = getACLDirectionOptions($t)
  const { form: parentForm } = useStepFormContext<FirewallFormModel>()
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
  }

  const handleSubmit = async () => {
    const newData = form.getFieldsValue()

    // new data should be update into "statefulAcls" by its direction
    const wholeOriginData = ([] as StatefulAcl[]).concat(parentForm.getFieldValue('statefulAcls'))
    const targetIndex = _.findIndex(wholeOriginData, { direction: editData.direction })
    wholeOriginData[targetIndex] = newData
    parentForm.setFieldValue('statefulAcls', wholeOriginData)
    onClose()
  }

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(editData)
    }
  }, [form, editData, visible])

  const footer = <Drawer.FormFooter
    buttonLabel={{ save: $t({ defaultMessage: 'Add' }) }}
    onCancel={onClose}
    onSave={async () => form.submit()}
  />

  return (
    <Drawer
      title={$t({ defaultMessage: 'Stateful ACL Settings' })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose
      width='60%'
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
      >
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Stateful ACL Name' })}
          rules={[{ required: true }, { max: 255 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          rules={[{ max: 255 }]}
        >
          <TextArea
            rows={3}
            maxLength={255}
            placeholder='Enter a short description, up to 255 characters'
          />
        </Form.Item>
        <Form.Item
          name='direction'
          label={$t({ defaultMessage: 'Direction' })}
          tooltip={
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Inbound - Traffic from Internet to WAN interface; Outbound - Traffic from WAN to Internet' })
          }
        >
          <Select
            options={aclDirectionList}
            disabled
          />
        </Form.Item>

        <Space
          direction='vertical'
          size={cssNumber('--acx-content-vertical-space')}
          style={{ width: '100%' }}
        >
          <Form.Item
            shouldUpdate={(prevValues, currentValues) => {
              return prevValues.rules !== currentValues.rules
                || prevValues.direction !== currentValues.direction
            }}
          >
            {({ getFieldValue }) => {
              const rules = getFieldValue('rules')
              const direction = getFieldValue('direction')

              return direction
                ? <Form.Item
                  name='rules'
                  label={$t({ defaultMessage: 'Rules({ruleCount})' },
                    { ruleCount: rules?.length ?? 0 })}
                  valuePropName='data'
                  initialValue={
                    direction === ACLDirection.INBOUND
                      ? InboundDefaultRules
                      : OutboundDefaultRules
                  }
                >
                  <StatefulACLRulesTable />
                </Form.Item>
                : null
            }}
          </Form.Item>
        </Space>
      </Form>
    </Drawer>
  )
}