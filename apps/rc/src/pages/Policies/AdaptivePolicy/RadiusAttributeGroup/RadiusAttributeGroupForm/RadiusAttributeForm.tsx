import React, { Key, useEffect, useState } from 'react'

import { Form, FormInstance, Input, Select, TreeSelect } from 'antd'
import {  useIntl }                                      from 'react-intl'

import { Loader }                                                                      from '@acx-ui/components'
import { useLazyRadiusAttributeListWithQueryQuery, useRadiusAttributeVendorListQuery } from '@acx-ui/rc/services'
import {
  AttributeAssignment,
  ipv6RegExp,
  cliIpAddressRegExp,
  DataType,
  OperatorType,
  RadiusAttribute,
  treeNode, checkObjectNotExists
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import { AttributeOperationLabelMapping } from '../../../contentsMap'

import { FieldSpace } from './styledComponents'

interface RadiusAttributeFormProps {
  form: FormInstance,
  isEdit?: boolean,
  editAttribute?: AttributeAssignment,
  getAttributeAssignments: () => AttributeAssignment []
}

export function RadiusAttributeForm (props: RadiusAttributeFormProps) {
  const { $t } = useIntl()
  const { form, isEdit = false, editAttribute, getAttributeAssignments } = props

  const [attributeTreeData, setAttributeTreeData] = useState([] as treeNode [])

  const commonAttributeKey = 'Common Attributes'

  const radiusAttributeVendorListQuery = useRadiusAttributeVendorListQuery({ params: {} })
  const [radiusAttributeListQuery] = useLazyRadiusAttributeListWithQueryQuery()

  const dataType = Form.useWatch('dataType', form)

  const [treeSelectValue, setTreeSelectValue] = useState<string | undefined>(undefined)

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])

  useEffect(()=>{
    if(radiusAttributeVendorListQuery.data) {
      const radiusVendors = radiusAttributeVendorListQuery.data.supportedVendors ?? []
      setAttributeTreeData(Array.of(toTreeNode(commonAttributeKey, false, [])).concat(
        radiusVendors.map(vendor => toTreeNode(vendor, false,[]))))
    }
  }, [radiusAttributeVendorListQuery.data])

  useEffect(() => {
    if(isEdit && editAttribute) {
      setTreeSelectValue(`${editAttribute.attributeName } (${editAttribute.dataType})`)
    } else{
      setTreeSelectValue(undefined)
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
      title: isLeaf ? `${value} (${dataType})` : value,
      isLeaf: isLeaf,
      selectable: isLeaf,
      children: children ?? undefined,
      dataType: dataType ?? undefined
    }
  }

  const getAttributeDataType = (attributeName: string) => {
    return getAttribute(attributeName)?.dataType
  }

  const getAttribute = (attributeName: string) : treeNode | undefined => {
    let findAttribute
    attributeTreeData.forEach(node => {
      if(node.children) {
        const attribute = node.children.find(node => node.value === attributeName)
        if(attribute) {
          findAttribute = attribute
        }
      }
    })
    return findAttribute
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attributeValueValidator = async (value: any) => {
    let result = true
    if(dataType === DataType.INTEGER || dataType === DataType.BYTE || dataType === DataType.SHORT) {
      result = !isNaN(value)
    } else if(dataType === DataType.IPADDR || dataType === DataType.COMBO_IP){
      return cliIpAddressRegExp(value)
    } else if(dataType === DataType.IPV6ADDR || dataType === DataType.IPV6PREFIX){
      return ipv6RegExp(value)
    }
    return result ? Promise.resolve() : Promise.reject($t(validationMessages.invalid))
  }

  const attributeValidator = (attributeName: string) => {
    const attributeAssignments = getAttributeAssignments()

    if(attributeAssignments.length === 0)
      return Promise.resolve()

    const operator = form.getFieldValue('operator')
    const attributeValue = form.getFieldValue('attributeValue')
    const list = attributeAssignments.filter(a => a.id !== editAttribute?.id)
      .map(n => ({ attributeName: n.attributeName,
        operator: n.operator, attributeValue: n.attributeValue }))

    return checkObjectNotExists(list,
      { attributeName: attributeName, operator: operator, attributeValue: attributeValue },
      $t({ defaultMessage: 'Attribute' }), 'value')
  }

  return (
    <Loader states={[{ isLoading: radiusAttributeVendorListQuery.isLoading }]}>
      <Form layout='vertical' form={form}>
        <Form.Item name='id' hidden children={<Input />}/>
        <Form.Item name='attributeName'
          label={$t({ defaultMessage: 'Attribute Type' })}
          rules={[{ required: true },
            { validator: (_, value) => attributeValidator(value) }]}
        >
          <Form.Item>
            <TreeSelect
              showArrow={false}
              showSearch
              value={treeSelectValue}
              placeholder={$t({ defaultMessage: 'Select attribute type' })}
              treeData={attributeTreeData}
              loadData={onLoadData}
              onSearch={(value) => {
                if(!getAttribute(value)) {
                  setTreeSelectValue(undefined)
                  form.setFieldsValue({ attributeName: undefined })
                }

                // expand the node if children match the search string
                if(value.length > 1) {
                  const matchedExpandedKeys = [] as string []
                  attributeTreeData.forEach(node => {
                    if(node.children && node.children.length > 0) {
                      const nodeKey = node.value
                      // eslint-disable-next-line max-len
                      if(node.children.find(attr => attr.value.includes(value)) && expandedKeys.indexOf(nodeKey) === -1)
                        matchedExpandedKeys.push(nodeKey)
                    }
                  })
                  setExpandedKeys([...expandedKeys, ...matchedExpandedKeys])
                }
              }}
              onChange={(value) => {
                if(!value) return
                setTreeSelectValue(value)
                form.setFieldsValue({ attributeName: value, dataType: getAttributeDataType(value) })
              }}
              treeExpandedKeys={expandedKeys}
              onTreeExpand={(nodeKeys: Key []) =>{
                // Loading attribute data if the nodes don't have the children
                nodeKeys.filter(key => {
                  const node = attributeTreeData.find(node => node.value === key)
                  if(!node) return false
                  return (!node.children || node.children.length === 0)
                }).forEach(key => onLoadData({ value: key }))

                setExpandedKeys([...nodeKeys])
              }}
              onDropdownVisibleChange={(open) => {
                if(!open) setExpandedKeys([])
              }}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item label={$t({ defaultMessage: 'Condition Value' })}>
          <FieldSpace>
            <Form.Item name='operator' initialValue={OperatorType.ADD}>
              <Select
                options={Object.keys(OperatorType).map(option =>
                  // eslint-disable-next-line max-len
                  ({ label: $t(AttributeOperationLabelMapping[option as OperatorType]), value: option }))}>
              </Select>
            </Form.Item>
            <Form.Item name='attributeValue'
              rules={[
                { required: true },
                { validator: (_, value) => attributeValueValidator(value) }]}
              children={<Input/>}/>
          </FieldSpace>
        </Form.Item>
        <Form.Item name='dataType' hidden children={<Input/>}/>
      </Form>
    </Loader>
  )
}
