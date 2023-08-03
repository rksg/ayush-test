import React, { useEffect, useState } from 'react'

import { Form, FormInstance, Input, Select } from 'antd'
import {  useIntl }                          from 'react-intl'

import { Loader }                                                                      from '@acx-ui/components'
import { useLazyRadiusAttributeListWithQueryQuery, useRadiusAttributeVendorListQuery } from '@acx-ui/rc/services'
import {
  AttributeAssignment,
  ipv6RegExp,
  cliIpAddressRegExp,
  DataType,
  OperatorType,
  RadiusAttribute,
  checkObjectNotExists
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

  const commonAttributeKey = 'Common Attributes'

  const { vendorList, vendorListIsLoading } = useRadiusAttributeVendorListQuery({ params: {} },{
    selectFromResult: ({ data, isLoading }) => ({
      vendorList: Array.of(commonAttributeKey).concat(data?.supportedVendors ?? []),
      vendorListIsLoading: isLoading
    })
  })
  const [radiusAttributeListQuery] = useLazyRadiusAttributeListWithQueryQuery()

  const dataType = Form.useWatch('dataType', form)

  const [attributesList, setAttributesList] = useState([] as RadiusAttribute [])

  const vendor = Form.useWatch('vendorName', form)

  useEffect(() =>{
    if(vendor) {
      setAttributesList([])
      const defaultPayload = {
        page: 0,
        pageSize: '10000',
        sortField: 'name',
        sortOrder: 'ASC'
      }
      const payload = vendor === commonAttributeKey ?
        { ...defaultPayload, filters: { showOnDefault: true } } :
        { ...defaultPayload, filters: { vendorName: vendor } }
      radiusAttributeListQuery({ payload }).then(result => {
        if (result.data) {
          setAttributesList(result.data.data)
          if(isEdit && editAttribute) {
            form.setFieldValue('attribute', editAttribute.attributeName )
          } else {
            form.setFieldValue('attribute', undefined)
          }
        }
      })
    }
  }, [vendor])

  useEffect(() => {
    if(isEdit && editAttribute) {
      const payload = {
        page: 0,
        pageSize: '1',
        filters: { name: editAttribute.attributeName }
      }

      radiusAttributeListQuery({ payload }).then(result => {
        if (result.data && result.data.data.length !== 0) {
          form.setFieldValue('vendorName', result.data.data[0].vendorName)
        }
      })
    } else{
      form.setFieldValue('vendorName', commonAttributeKey)
    }
  }, [editAttribute])

  const getAttributeDataType = (attributeName: string) => {
    return getAttribute(attributeName)?.dataType
  }

  const getAttribute = (attributeName: string) : RadiusAttribute | undefined => {
    const findAttribute = attributesList.filter(attribute => attribute.name === attributeName)
    return findAttribute && findAttribute.length !== 0 ? findAttribute[0] : undefined
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
    <Loader states={[{ isLoading: vendorListIsLoading }]}>
      <Form layout='vertical' form={form}>
        <Form.Item name='id' hidden children={<Input />}/>
        <Form.Item name='attributeName'
          label={$t({ defaultMessage: 'Attribute Type' })}
          rules={[{ required: true },
            { validator: (_, value) => attributeValidator(value) }]}
          children={
            <>
              <Form.Item name='vendorName'
                children={
                  <Select
                    showSearch={true}
                    allowClear
                    placeholder={$t({ defaultMessage: 'Select vendor...' })}
                    options={vendorList.sort().map(set => ({ value: set, label: set }))}
                  />
                }/>
              <Form.Item name='attribute'
                children={
                  <Select
                    showSearch={true}
                    allowClear
                    placeholder={$t({ defaultMessage: 'Select attribute...' })}
                    options={attributesList.map(attribute =>
                      // eslint-disable-next-line max-len
                      ({ value: attribute.name, label: `${attribute.name} (${attribute.dataType})` }))}
                    // eslint-disable-next-line max-len
                    onChange={(value: string) => form.setFieldsValue({ attributeName: value, dataType: getAttributeDataType(value) })}
                  />
                }/>
            </>
          }
        />
        {/*</Form.Item>*/}
        <Form.Item label={$t({ defaultMessage: 'Condition Value' })}>
          <FieldSpace>
            <Form.Item name='operator' initialValue={OperatorType.ADD}>
              <Select
                style={{ width: '200px' }}
                options={Object.keys(OperatorType).map(option =>
                  // eslint-disable-next-line max-len
                  ({ label: $t(AttributeOperationLabelMapping[option as OperatorType]), value: option }))}>
              </Select>
            </Form.Item>
            <Form.Item name='attributeValue'
              style={{ marginLeft: '50px' }}
              rules={[
                { required: true,
                  message: $t({ defaultMessage: 'Please enter Condition Value' }) },
                { validator: (_, value) => attributeValueValidator(value) }]}
              children={<Input/>}/>
          </FieldSpace>
        </Form.Item>
        <Form.Item name='dataType' hidden children={<Input/>}/>
      </Form>
    </Loader>
  )
}
