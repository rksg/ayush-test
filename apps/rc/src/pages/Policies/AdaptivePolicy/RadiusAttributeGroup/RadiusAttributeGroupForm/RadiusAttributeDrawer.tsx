import React, { useEffect, useState } from 'react'

import { Form, Input, Select, Space, TreeSelect } from 'antd'
import { defineMessage, useIntl }                 from 'react-intl'

import { Drawer }                                                       from '@acx-ui/components'
import { useLazyRadiusAttributeListWithQueryQuery }                     from '@acx-ui/rc/services'
import { AttributeAssignment, OperatorType, RadiusAttribute, treeNode } from '@acx-ui/rc/utils'

interface RadiusAttributeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit?: boolean
  editAttribute?: AttributeAssignment,
  setAttributeAssignments: (attribute: AttributeAssignment) => void
  vendorList: string []
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
  const { visible, setVisible, isEdit, editAttribute, setAttributeAssignments, vendorList } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)
  const [attributeName] = useState<string | undefined>(undefined)
  const [attributeTreeData, setAttributeTreeData] = useState([] as treeNode [])
  const [radiusAttributeListQuery] = useLazyRadiusAttributeListWithQueryQuery()
  const commonAttributeKey = 'Common Attributes'

  useEffect(() => {
    if (editAttribute && visible) {
      form.setFieldsValue(editAttribute)
    }
  }, [editAttribute, visible])

  useEffect(() => {
    setAttributeTreeData(Array.of(toTreeNode(commonAttributeKey, false, [])).concat(
      vendorList.map(vendor => toTreeNode(vendor, false,[]))))
  }, [vendorList])

  const toTreeNode = (
    value: string,
    isLeaf: boolean,
    children?: treeNode [],
    dataType?: string) : treeNode => {
    return {
      value: value,
      title: value,
      isLeaf: isLeaf,
      selectable: isLeaf,
      children: children ?? undefined,
      dataType: dataType ?? undefined
    }
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
    let dataType
    attributeTreeData.forEach(node => {
      if(node.children) {
        const attribute = node.children.find(node => node.value === attributeName)
        if(attribute) {
          dataType = attribute.dataType
        }
      }
    })
    return dataType
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onLoadData = async (treeNode: any) => {
    const defaultPayload = {
      page: '1',
      pageSize: '10000'
    }
    const payload = treeNode.value === commonAttributeKey ?
      { ...defaultPayload, filters: { showOnDefault: true } } :
      { ...defaultPayload, filters: { vendorName: treeNode.value } }
    const attributeList = (await radiusAttributeListQuery({ payload }).unwrap()).data
    if(attributeList.length > 0) {
      setAttributeTreeData(attributeTreeData.map(node => {
        if(node.value === treeNode.value) {
          node.children = attributeList.map((v: RadiusAttribute) =>
            toTreeNode(v.name, true, undefined, v.dataType))
        }
        return node
      }))
    }
  }


  const content = (
    <Form layout='vertical' form={form} onFinish={onSubmit}>
      <Form.Item name='id' hidden children={<Input />}/>
      <Form.Item name='attributeName'
        label={$t({ defaultMessage: 'Attribute Type' })}
        rules={[{ required: true }]}
      >
        <TreeSelect
          showSearch
          value={attributeName}
          placeholder={$t({ defaultMessage: 'Select attribute type' })}
          treeData={attributeTreeData}
          loadData={onLoadData}
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
          <Form.Item name='attributeValue'
            rules={[{ required: true }]}
            children={<Input />}/>
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
