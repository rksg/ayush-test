import React, { useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer, Loader }                                                       from '@acx-ui/components'
import { useLazyAttributesListQuery }                                           from '@acx-ui/rc/services'
import { AccessCondition, checkObjectNotExists, CriteriaOption, RuleAttribute } from '@acx-ui/rc/utils'

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
  const conditionId = Form.useWatch('conditionId', form)

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
    } else {
      setAttributes([] as RuleAttribute [])
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
        // eslint-disable-next-line max-len
        criteriaType: getCriteriaOptionByValue(editCondition.evaluationRule.criteriaType),
        attributeValue: editCondition.evaluationRule.regexStringCriteria
      }
      form.setFieldsValue(editData)
    }
  }, [editCondition, visible])

  const getCriteriaOptionByValue = (value: string) => {
    // eslint-disable-next-line max-len
    return Object.keys(CriteriaOption).find(item => CriteriaOption[item as keyof typeof CriteriaOption] === value)
  }

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

  const conditionsValidator = async (attributeId: number) => {
    if(!accessConditions)
      return Promise.resolve()
    const list =
      // eslint-disable-next-line max-len
      accessConditions.filter(n => n.templateAttributeId === attributeId && n.id !== conditionId).map(n => ({ name: n.templateAttributeId }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: attributeId }, $t({ defaultMessage: 'Condition Type' }))
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
            disabled={isEdit}
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
        <Form.Item label={$t({ defaultMessage: 'Condition Value' })}
          name='attributeValue'
          rules={[{ required: true,
            message: $t({ defaultMessage: 'Please enter Condition Value' }) }]}
          children={<Input />}/>
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
