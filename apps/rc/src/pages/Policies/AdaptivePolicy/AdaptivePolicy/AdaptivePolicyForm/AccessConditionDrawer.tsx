import React, { useEffect, useState } from 'react'

import { ProForm }             from '@ant-design/pro-form'
import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer, Loader }                                                       from '@acx-ui/components'
import { useLazyAttributesListQuery }                                           from '@acx-ui/rc/services'
import { AccessCondition, checkObjectNotExists, CriteriaOption, RuleAttribute } from '@acx-ui/rc/utils'

import useWatch = ProForm.useWatch

interface AccessConditionDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit?: boolean,
  editCondition?: AccessCondition,
  setAccessCondition: (condition: AccessCondition) => void,
  templateId: number | undefined,
  accessConditions: AccessCondition []
}

export function AccessConditionDrawer (props: AccessConditionDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { visible, setVisible, isEdit = false, setAccessCondition, editCondition, templateId, accessConditions } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)
  const [attributes, setAttributes] = useState([] as RuleAttribute [])
  const conditionId = useWatch('conditionId', form)
  const typeName = useWatch('name', form)

  const [attributeList, { isLoading } ] = useLazyAttributesListQuery()

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
        criteriaType: CriteriaOption[data.criteriaType as keyof typeof CriteriaOption],
        regexStringCriteria: data.attributeValue
      }
    } as AccessCondition
    setAccessCondition(condition)
    onClose()
  }

  const conditionsValidator = async (value: number) => {
    if(!accessConditions)
      return Promise.resolve()
    const list =
      // eslint-disable-next-line max-len
      accessConditions.filter(n => n.templateAttributeId === value && n.id !== conditionId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: typeName }, $t({ defaultMessage: 'Condition Type' }))
  }

  const content = (
    <Loader states={[{ isLoading }]}>
      <Form layout='vertical' form={form} onFinish={onSubmit}>
        <Form.Item name='conditionId' hidden children={<Input />}/>
        <Form.Item name='name' hidden children={<Input />}/>
        <Form.Item name='criteriaType' hidden children={<Input />}/>
        <Form.Item name='templateAttributeId'
          label={$t({ defaultMessage: 'Condition Type' })}
          rules={[
            { required: true },
            { validator: (_, value) => conditionsValidator(value) }
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
        {/*<Form.Item label={$t({ defaultMessage: 'Condition Value' })}>*/}
        {/*<Space direction='horizontal'>*/}
        {/*  <Form.Item name='operator' initialValue={OperationTypeOption[0].value}>*/}
        {/*    <Select*/}
        {/*      options={OperationTypeOption?.map(p => ({ label: $t(p.label), value: p.value }))}>*/}
        {/*    </Select>*/}
        {/*  </Form.Item>*/}
        <Form.Item label={$t({ defaultMessage: 'Condition Value' })}
          name='attributeValue'
          rules={[{ required: true,
            message: $t({ defaultMessage: 'Please enter Condition Value' }) }]}
          children={<Input />}/>
        {/*</Space>*/}
        {/*</Form.Item>*/}
      </Form>
    </Loader>
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
