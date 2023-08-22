import React, { useEffect, useState } from 'react'

import { Form, Input, Radio, Select, Space, TimePicker } from 'antd'
import moment                                            from 'moment-timezone'
import { useIntl }                                       from 'react-intl'

import { Drawer, Loader }                              from '@acx-ui/components'
import { useLazyGetPolicyTemplateAttributesListQuery } from '@acx-ui/rc/services'
import {
  AccessCondition,
  checkObjectNotExists, CriteriaFormData,
  CriteriaOption, EvaluationRule,
  RuleAttribute
} from '@acx-ui/rc/utils'


interface AccessConditionDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit?: boolean,
  editCondition?: AccessCondition,
  setAccessConditions: (condition: AccessCondition) => void,
  templateId: number | undefined,
  accessConditions: AccessCondition []
}

export function AccessConditionDrawer (props: AccessConditionDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { visible, setVisible, isEdit = false, setAccessConditions, editCondition, templateId, accessConditions } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)
  const [attributes, setAttributes] = useState([] as RuleAttribute [])

  const conditionId = Form.useWatch('conditionId', form)
  const attributeType = Form.useWatch('attributeType', form)

  const [attributeList, { isLoading } ] = useLazyGetPolicyTemplateAttributesListQuery()

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
        name: editCondition.name ?? editCondition.templateAttribute?.name,
        ...toEvaluationRuleForm(editCondition.evaluationRule)
      }
      form.setFieldsValue(editData)
    } else {
      form.resetFields()
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
      evaluationRule: toEvaluationRuleData({ ...data }),
      templateAttribute: {
        attributeType: data.attributeType
      }
    } as AccessCondition
    setAccessConditions(condition)
    onClose()
  }

  const toEvaluationRuleData = (data: CriteriaFormData) => {
    const criteriaType = CriteriaOption[data.attributeType as keyof typeof CriteriaOption]
    if(criteriaType === CriteriaOption.DATE_RANGE) {
      return {
        criteriaType,
        when: data.when,
        startTime: moment(data.start).format('HH:mm'),
        endTime: moment(data.end).format('HH:mm'),
        zoneOffset: getZoneHourOffset()
      }
    } else {
      return {
        criteriaType,
        regexStringCriteria: data.attributeValue
      }
    }
  }

  const getZoneHourOffset = () => {
    const timezoneOffset = new Date().getTimezoneOffset()
    const offset = Math.abs(timezoneOffset)
    const offsetOperator = timezoneOffset < 0 ? '+' : '-'
    const offsetHours = Math.floor(offset / 60).toString().padStart(2, '0')
    const offsetMinutes = Math.floor(offset % 60).toString().padStart(2, '0')
    return `${offsetOperator}${offsetHours}:${offsetMinutes}`
  }

  const toEvaluationRuleForm = (evaluationRule: EvaluationRule) => {
    if(evaluationRule.criteriaType === CriteriaOption.DATE_RANGE) {
      return {
        attributeType: getCriteriaOptionByValue(evaluationRule.criteriaType),
        when: evaluationRule.when,
        start: moment(evaluationRule.startTime, 'HH:mm'),
        end: moment(evaluationRule.endTime, 'HH:mm')
      }
    } else {
      return {
        attributeType: getCriteriaOptionByValue(evaluationRule.criteriaType),
        attributeValue: evaluationRule.regexStringCriteria
      }
    }
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
        <Form.Item name='attributeType' hidden children={<Input />}/>
        <Form.Item name='templateAttributeId'
          label={$t({ defaultMessage: 'Condition Type' })}
          rules={[
            { required: true },
            { validator: (_, value) => conditionsValidator(value) }
          ]}>
          <Select
            disabled={isEdit}
            options={attributes.map(p => {
              const label = p.attributeType === 'DATE_RANGE' ? p.name :
                $t({ defaultMessage: '{name} (Regex)' }, { name: p.name })
              return ({ label, value: p.id })
            })}
            onChange={(value) => {
              const attr = attributes.find((attribute) => attribute.id === value)
              if(attr) {
                form.setFieldsValue({
                  templateAttributeId: attr.id,
                  name: attr.name,
                  attributeType: attr.attributeType
                })
              }
            }}
          >
          </Select>
        </Form.Item>
        {
          attributeType !== 'DATE_RANGE' ?
            <Form.Item label={$t({ defaultMessage: 'Condition Value' })}
              name='attributeValue'
              rules={[{ required: true }, { max: 255 }]}
              children={<Input />}/>
            : <>
              <Form.Item label={$t({ defaultMessage: 'When' })}
                name='when'
                rules={[{ required: true, message: $t({ defaultMessage: 'Please select When' }) }]}
                children={
                  <Radio.Group>
                    <Space direction='vertical'>
                      <Radio value={'Weekend'}>
                        {$t({ defaultMessage: 'Weekend (Sat & Sun)' })}
                      </Radio>
                      <Radio value={'Weekdays'}>
                        {$t({ defaultMessage: 'Weekdays (Mon-Fri)' })}
                      </Radio>
                      <Radio value={'All'}>
                        {$t({ defaultMessage: 'All Days' })}
                      </Radio>
                    </Space>
                  </Radio.Group>
                }/>
              <Form.Item label={$t({ defaultMessage: 'Hours' })}>
                <Space direction='horizontal'>
                  <Form.Item
                    name='start'
                    rules={[{ required: true, message:
                        $t({ defaultMessage: 'Please enter From' }) }]}
                    children={<TimePicker
                      format='h:mm a'
                      placeholder={$t({ defaultMessage: 'From...' })}/>}/>
                  <Form.Item
                    name='end'
                    rules={[{ required: true, message:
                        $t({ defaultMessage: 'Please enter To' }) }]}
                    children={<TimePicker
                      format='h:mm a'
                      placeholder={$t({ defaultMessage: 'To...' })}/>}/>
                </Space>
              </Form.Item>
            </>
        }
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
