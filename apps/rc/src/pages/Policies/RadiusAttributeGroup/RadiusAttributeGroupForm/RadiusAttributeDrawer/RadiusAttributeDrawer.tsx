import React, { useEffect, useState } from 'react'

import { Form, Input, Select, Space, TreeSelect } from 'antd'
import { defineMessage, useIntl }                 from 'react-intl'

import { Drawer }                                                       from '@acx-ui/components'
import { AttributeAssignment, OperatorType, RadiusAttribute, treeNode } from '@acx-ui/rc/utils'

interface RadiusAttributeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit?: boolean
  editAttribute?: AttributeAssignment,
  setAttributeAssignments: (attribute: AttributeAssignment) => void
  // radiusAttributeTreeData?: treeNode []
  radiusAttributes: RadiusAttribute []
}

const OperationTypeOption = [
  { label: defineMessage({ defaultMessage: 'Add (Multiple)' }), value: OperatorType.ADD },
  // eslint-disable-next-line max-len
  { label: defineMessage({ defaultMessage: 'Add or Replace (Single)' }), value: OperatorType.ADD_REPLACE },
  // eslint-disable-next-line max-len
  { label: defineMessage({ defaultMessage: 'ADD if it Doesn\'t Exist' }), value: OperatorType.DOES_NOT_EXIST }
]

export function RadiusAttributeDrawer (props: RadiusAttributeDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { visible, setVisible, isEdit, editAttribute, setAttributeAssignments, radiusAttributes } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)
  const [attributeName] = useState<string | undefined>(undefined)
  const [attributeTreeData, setAttributeTreeData] = useState([] as treeNode [])

  useEffect(() => {
    form.setFieldsValue(editAttribute)
  }, [editAttribute, form])

  useEffect(() => {
    setAttributeTreeData(transferToTreeData(radiusAttributes))
  }, [radiusAttributes])

  const transferToTreeData = (attributes: RadiusAttribute []) => {
    const groupedAttributes = attributes.reduce(function (r, a) {
      r[a.vendorName] = r[a.vendorName] || []
      r[a.vendorName].push(a)
      return r
    }, Object.create(null))

    // eslint-disable-next-line max-len
    const toTreeNode = (value: string, children?: treeNode [], selectable?: boolean) : treeNode => {
      return {
        value: value,
        title: value,
        selectable: selectable ?? true,
        children: children ?? undefined
      }
    }

    return Object.keys(groupedAttributes).map(key => {
      const children = groupedAttributes[key].map((v: RadiusAttribute) => toTreeNode(v.name))
      return toTreeNode(key, children, false)
    })
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onSubmit = (data: AttributeAssignment) => {
    setAttributeAssignments(data)
    onClose()
  }

  const getAttributeDataType = (attributeName: string) => {
    return radiusAttributes.find(a => a.name === attributeName)?.dataType
  }

  const content = (
    <Form layout='vertical' form={form} onFinish={onSubmit}>
      <Form.Item name='id' hidden children={<Input />}/>
      <Form.Item name='attributeName' label={$t({ defaultMessage: 'Attribute Type' })}>
        <TreeSelect
          showSearch
          value={attributeName}
          placeholder={$t({ defaultMessage: 'Select attribute type' })}
          treeData={attributeTreeData}
          onChange={(value) => {
            form.setFieldValue('dataType', getAttributeDataType(value))
          }}
        />
      </Form.Item>
      <Form.Item label={$t({ defaultMessage: 'Condition Value' })}>
        <Space direction='horizontal'>
          <Form.Item name='operator' initialValue={OperationTypeOption[0].value}>
            <Select
              options={OperationTypeOption?.map(p => ({ label: $t(p.label), value: p.value }))}>
            </Select>
          </Form.Item>
          <Form.Item name='attributeValue' children={<Input />}/>
        </Space>
      </Form.Item>
      <Form.Item name='dataType' hidden children={<Input/>}/>
    </Form>
  )

  const footer = (
    <Drawer.FormFooter
      onCancel={resetFields}
      buttonLabel={{
        save: isEdit ? $t({ defaultMessage: 'Done' }) :
          $t({ defaultMessage: 'Add' })
      }}
      onSave={async () => {
        form.submit()
      }}
    />
  )

  return (
    <Drawer
      //eslint-disable-next-line max-len
      title={isEdit ? $t({ defaultMessage: 'Edit RADIUS Attribute' }) : $t({ defaultMessage: 'Add RADIUS Attribute' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={600}
    />
  )
}
