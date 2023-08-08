import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Table, TableProps }                                                              from '@acx-ui/components'
import { useLazyRadiusAttributeGroupListByQueryQuery }                                    from '@acx-ui/rc/services'
import { AttributeAssignment, checkObjectNotExists, defaultSort, OperatorType, sortProp } from '@acx-ui/rc/utils'
import { useParams }                                                                      from '@acx-ui/react-router-dom'

import { AttributeOperationLabelMapping } from '../../../contentsMap'


function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<AttributeAssignment>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'RADIUS Attribute' }),
      dataIndex: 'attributeName',
      sorter: { compare: sortProp('attributeName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Attribute Value' }),
      key: 'attributeValue',
      dataIndex: 'attributeValue',
      sorter: { compare: sortProp('attributeValue', defaultSort) },
      render: function (_, row) {
        // eslint-disable-next-line max-len
        return `${$t(AttributeOperationLabelMapping[row.operator as OperatorType])} '${row.attributeValue}'`
      }
    }
  ]
  return columns
}

interface RadiusAttributeGroupSettingFormProps {
  onAddClick: () => void,
  onEditClick: (attribute: AttributeAssignment) => void
}

export function RadiusAttributeGroupSettingForm (props: RadiusAttributeGroupSettingFormProps) {
  const { $t } = useIntl()
  const [attributeGroup] = useLazyRadiusAttributeGroupListByQueryQuery()
  const { policyId } = useParams()
  const form = Form.useFormInstance()
  const attributeAssignments = Form.useWatch('attributeAssignments')
  const { onEditClick, onAddClick } = props

  const handleAttributeAssignments = (attribute: AttributeAssignment[]) => {
    form.setFieldValue('attributeAssignments', attribute)
  }

  const nameValidator = async (value: string) => {
    const list = (await attributeGroup({
      params: {
        excludeContent: 'false'
      },
      payload: {
        fields: [ 'name' ],
        page: 1, pageSize: 2147483647,
        filters: { name: value }
      }
    }).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'RADIUS Attribute Group' }))
  }

  const rowActions: TableProps<AttributeAssignment>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows, clearSelection) => {
        onEditClick(selectedRows[0])
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        const newAttributes = attributeAssignments.filter((r: AttributeAssignment) => {
          return selectedRows[0].id !== r.id
        })
        handleAttributeAssignments(newAttributes)
        clearSelection()
      }
    }
  ]

  return (
    <>
      <Form.Item name='name'
        label={$t({ defaultMessage: 'Group Name' })}
        rules={[
          { required: true },
          { validator: (_, value) => nameValidator(value) },
          { max: 255 }
        ]}
        validateFirst
        hasFeedback
        children={<Input/>}
        validateTrigger={'onBlur'}
      />
      <Form.Item
        name='attributeAssignments'
        label={$t({ defaultMessage: 'RADIUS Attributes' })}
        rules={[
          {
            required: true,
            message: $t({ defaultMessage: 'Please create RADIUS Attributes' })
          }]}
      >
        <>
          {$t({ defaultMessage: 'These attributes will be returned when a client connects...' })}
          <Table
            rowKey='id'
            columns={useColumns()}
            dataSource={attributeAssignments}
            rowActions={rowActions}
            rowSelection={{ type: 'radio' }}
            actions={[{
              label: $t({ defaultMessage: 'Add' }),
              onClick: () => {
                onAddClick()
              }
            }]}
          />
        </>
      </Form.Item>
    </>
  )
}
