import React from 'react'

import { Form, Input, Col, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useLazyRadiusAttributeGroupListQuery
} from '@acx-ui/rc/services'
import {
  AttributeAssignment,
  checkObjectNotExists
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<AttributeAssignment>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'RADIUS Attribute' }),
      dataIndex: 'attributeName'
    },
    {
      title: $t({ defaultMessage: 'Attribute Value' }),
      key: 'attributeValue',
      dataIndex: 'attributeValue'
    }
  ]
  return columns
}

export function RadiusAttributeGroupSettingForm () {
  const { $t } = useIntl()
  const [attributeGroup] = useLazyRadiusAttributeGroupListQuery()
  const { policyId } = useParams()
  const form = Form.useFormInstance()
  const attributeAssignments = Form.useWatch('attributeAssignments')

  const handleAttributeAssignments = (attribute: AttributeAssignment[]) => {
    form.setFieldValue('attributeAssignments', attribute)
  }

  const nameValidator = async (value: string) => {
    const list = (await attributeGroup({}).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'RADIUS Attribute Group' }))
  }

  const rowActions: TableProps<AttributeAssignment>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows, clearSelection) => {
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Attribute' }),
            entityValue: selectedRows[0].attributeName
          },
          onOk: () => {
            const newAttributes = attributeAssignments.filter((r: AttributeAssignment) => {
              return selectedRows[0].id !== r.id
            })
            handleAttributeAssignments(newAttributes)
            clearSelection()
          }
        })
      }
    }
  ]

  return (
    <Row>
      <Col span={6}>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input/>}
        />
      </Col>
      <Col span={24}/>
      <Col span={8}>
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
                // show drawer

                // setIsEditMode(false)
                // setVisible(true)
                // setEditData({} as MacRegistration)
                }
              }]}
            />
          </>
        </Form.Item>
      </Col>
    </Row>
  )
}
