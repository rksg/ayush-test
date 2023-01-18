import React, { useEffect, useState } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'
import { v4 as uuidv4 }          from 'uuid'

import { showActionModal, Table, TableProps }                      from '@acx-ui/components'
import {
  useLazyRadiusAttributeGroupListQuery,
  useRadiusAttributeListQuery, useRadiusAttributeVendorListQuery
} from '@acx-ui/rc/services'
import { AttributeAssignment, checkObjectNotExists, RadiusAttribute } from '@acx-ui/rc/utils'
import { useParams }                                                  from '@acx-ui/react-router-dom'

import { RadiusAttributeDrawer } from '../RadiusAttributeDrawer/RadiusAttributeDrawer'

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
      dataIndex: 'attributeValue',
      render: function (data, row) {
        return `${row.operator} '${row.attributeValue}'`
      }
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
  const [visible, setVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editAttribute, setEditAttribute] = useState<AttributeAssignment>()
  const [radiusAttributes, setRadiusAttributes] = useState([] as RadiusAttribute[])
  const [radiusVendors, setRadiusVendors] = useState([] as string [])

  const radiusAttributesQuery = useRadiusAttributeListQuery({
    params: {
      page: '1',
      pageSize: '500'
    }
  })

  const radiusAttributeVendorListQuery = useRadiusAttributeVendorListQuery({ params: {} })

  useEffect(()=>{
    if(radiusAttributesQuery.data) {
      setRadiusAttributes(radiusAttributesQuery.data.data ?? [])
    }
  }, [radiusAttributesQuery.data])

  useEffect(()=>{
    if(radiusAttributeVendorListQuery.data) {
      setRadiusVendors(radiusAttributeVendorListQuery.data.supportedVendors ?? [])
    }
  }, [radiusAttributeVendorListQuery.data])

  const handleAttributeAssignments = (attribute: AttributeAssignment[]) => {
    form.setFieldValue('attributeAssignments', attribute)
  }

  const nameValidator = async (value: string) => {
    const list = (await attributeGroup({
      payload: {
        page: '1',
        pageSize: '10000'
      }
    }).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'RADIUS Attribute Group' }))
  }

  const setAttributeAssignments = (attribute: AttributeAssignment) => {
    // eslint-disable-next-line max-len
    const newAttribute: AttributeAssignment[] = attributeAssignments ? attributeAssignments.slice() : []
    if (editMode) {
      const targetIdx = newAttribute.findIndex((r: AttributeAssignment) => r.id === attribute.id)
      newAttribute.splice(targetIdx, 1, attribute)
    } else {
      attribute.id = uuidv4()
      newAttribute.push(attribute)
    }
    form.setFieldValue('attributeAssignments', newAttribute)
  }

  const rowActions: TableProps<AttributeAssignment>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows, clearSelection) => {
        setEditMode(true)
        setVisible(true)
        setEditAttribute(selectedRows[0])
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
                  setEditAttribute({} as AttributeAssignment)
                  setEditMode(false)
                  setVisible(true)
                }
              }]}
            />
            <RadiusAttributeDrawer
              visible={visible}
              setVisible={setVisible}
              isEdit={editMode}
              editAttribute={editAttribute}
              // radiusAttributeTreeData={attributeTreeData}
              radiusAttributes={radiusAttributes}
              vendorList={radiusVendors}
              setAttributeAssignments={setAttributeAssignments}/>
          </>
        </Form.Item>
      </Col>
    </Row>
  )
}
