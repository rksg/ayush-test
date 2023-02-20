import React, { useEffect, useState } from 'react'

import { Form, Input, Select, Space } from 'antd'
import { defineMessage, useIntl }     from 'react-intl'

import { Drawer }                         from '@acx-ui/components'
import { useLazyAttributesListQuery }     from '@acx-ui/rc/services'
import { AccessCondition, RuleAttribute } from '@acx-ui/rc/utils'

interface RadiusAttributeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit?: boolean,
  editCondition?: AccessCondition,
  setAccessCondition: (condition: AccessCondition) => void,
  templateId: number | undefined
}

const OperationTypeOption = [
  { label: defineMessage({ defaultMessage: 'Equals' }), value: 'Equals' },
  { label: defineMessage({ defaultMessage: 'Does not equal' }), value: 'Does not equal' },
  { label: defineMessage({ defaultMessage: 'Contains' }), value: 'Contains' },
  { label: defineMessage({ defaultMessage: 'Does not contain' }), value: 'Does not contain' },
  { label: defineMessage({ defaultMessage: 'Start with' }), value: 'Start with' },
  { label: defineMessage({ defaultMessage: 'Ends with' }), value: 'Ends with' }
]

export function AccessConditionDrawer (props: RadiusAttributeDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { visible, setVisible, isEdit = false, setAccessCondition, editCondition, templateId } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)
  const [attributes, setAttributes] = useState([] as RuleAttribute [])

  const [attributeList] = useLazyAttributesListQuery()

  useEffect(() => {
    if(templateId) {
      const setData = async () => {
        const list = (await attributeList({
          params: { templateId: templateId.toString() },
          payload: { page: '1', pageSize: '10000' }
        }, true).unwrap())
        setAttributes(list.data)
      }
      setData()
    }
  }, [templateId])

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  useEffect(() => {
    if (editCondition && visible) {
      const editData = {
        conditionId: editCondition.id,
        templateAttributeId: editCondition.templateAttributeId,
        name: editCondition.name,
        criteriaType: editCondition.evaluationRule.criteriaType,
        attributeValue: editCondition.evaluationRule.regexStringCriteria
        // operator // support?
      }
      form.setFieldsValue(editData)
    }
  }, [editCondition, visible])

  const onSubmit = () => {
    const data = form.getFieldsValue()
    const condition = {
      id: data.conditionId,
      name: data.name,
      templateAttributeId: data.templateAttributeId,
      evaluationRule: {
        criteriaType: data.criteriaType,
        regexStringCriteria: data.attributeValue
      }
    } as AccessCondition
    setAccessCondition(condition)
    onClose()
  }

  const content = (
    <Form layout='vertical' form={form} onFinish={onSubmit}>
      <Form.Item name='conditionId' hidden children={<Input />}/>
      <Form.Item name='name' hidden children={<Input />}/>
      <Form.Item name='criteriaType' hidden children={<Input />}/>
      <Form.Item name='templateAttributeId'
        label={$t({ defaultMessage: 'Condition Type' })}
        rules={[
          { required: true }
        ]}
      >
        <Select
          // eslint-disable-next-line max-len
          options={attributes.map(p => ({ label: p.name, value: p.id }))}
          onChange={(value) => {
            const attr = attributes.find((attribute) => attribute.id === value)
            if(attr) {
              form.setFieldsValue({
                templateAttributeId: attr.id,
                name: attr.name,
                criteriaType: attr.attributeType
              })
            }
          }}
        >
        </Select>
      </Form.Item>
      <Form.Item label={$t({ defaultMessage: 'Condition Value' })}>
        <Space direction='horizontal'>
          <Form.Item name='operator' initialValue={OperationTypeOption[0].value}>
            <Select
              options={OperationTypeOption?.map(p => ({ label: $t(p.label), value: p.value }))}>
            </Select>
          </Form.Item>
          <Form.Item name='attributeValue'
            rules={[{ required: true,
              message: $t({ defaultMessage: 'Please enter Condition Value' }) }]}
            children={<Input />}/>
        </Space>
      </Form.Item>
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
      title={isEdit ? $t({ defaultMessage: 'Edit Access Condition' }) : $t({ defaultMessage: 'Add Access Condition' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={600}
    />
  )
}
