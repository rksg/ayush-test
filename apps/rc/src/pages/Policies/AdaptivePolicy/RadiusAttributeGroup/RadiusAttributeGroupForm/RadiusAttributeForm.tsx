import React, { useEffect, useState } from 'react'

import { Form, FormInstance, Input, Select, Space, TreeSelect } from 'antd'
import {  useIntl }                                             from 'react-intl'

import { Loader }                                                                      from '@acx-ui/components'
import { useLazyRadiusAttributeListWithQueryQuery, useRadiusAttributeVendorListQuery } from '@acx-ui/rc/services'
import { AttributeAssignment, OperatorType, RadiusAttribute, treeNode }                from '@acx-ui/rc/utils'

import { AttributeOperationLabelMapping } from '../../../contentsMap'


interface RadiusAttributeFormProps {
  form: FormInstance,
  editAttribute?: AttributeAssignment
}

export function RadiusAttributeForm (props: RadiusAttributeFormProps) {
  const { $t } = useIntl()
  const { form, editAttribute } = props
  const [attributeName] = useState<string | undefined>(undefined)
  const [attributeTreeData, setAttributeTreeData] = useState([] as treeNode [])

  const commonAttributeKey = 'Common Attributes'

  const radiusAttributeVendorListQuery = useRadiusAttributeVendorListQuery({ params: {} })
  const [radiusAttributeListQuery] = useLazyRadiusAttributeListWithQueryQuery()

  useEffect(()=>{
    if(radiusAttributeVendorListQuery.data) {
      const radiusVendors = radiusAttributeVendorListQuery.data.supportedVendors ?? []
      setAttributeTreeData(Array.of(toTreeNode(commonAttributeKey, false, [])).concat(
        radiusVendors.map(vendor => toTreeNode(vendor, false,[]))))
    }
  }, [radiusAttributeVendorListQuery.data])

  useEffect(() => {
    if (editAttribute) {
      form.setFieldsValue(editAttribute)
    }
  }, [editAttribute])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onLoadData = async (treeNode: any) => {
    const defaultPayload = {
      page: 0,
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

  return (
    <Loader states={[{ isLoading: radiusAttributeVendorListQuery.isLoading }]}>
      <Form layout='vertical' form={form}>
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
            <Form.Item name='operator' initialValue={OperatorType.ADD}>
              <Select
                options={Object.keys(OperatorType).map(option =>
                // eslint-disable-next-line max-len
                  ({ label: $t(AttributeOperationLabelMapping[option as OperatorType]), value: option }))}>
              </Select>
            </Form.Item>
            <Form.Item name='attributeValue'
              rules={[{ required: true }]}
              children={<Input />}/>
          </Space>
        </Form.Item>
        <Form.Item name='dataType' hidden children={<Input/>}/>
      </Form>
    </Loader>
  )
}
