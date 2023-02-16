import React, { useEffect, useState } from 'react'

import { Form, Input, Select, Space } from 'antd'
import { defineMessage, useIntl }     from 'react-intl'

import { Drawer }          from '@acx-ui/components'
import { AccessCondition } from '@acx-ui/rc/utils'

interface RadiusAttributeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit?: boolean,
  editCondition?: AccessCondition,
  setAccessCondition: (condition: AccessCondition) => void
}

const OperationTypeOption = [
  { label: defineMessage({ defaultMessage: 'Equals' }), value: 'Equals' },
  { label: defineMessage({ defaultMessage: 'Does not equal' }), value: 'Does not equal' },
  { label: defineMessage({ defaultMessage: 'Contains' }), value: 'Contains' },
  { label: defineMessage({ defaultMessage: 'Does not contain' }), value: 'Does not contain' },
  { label: defineMessage({ defaultMessage: 'Start with' }), value: 'Start with' },
  { label: defineMessage({ defaultMessage: 'Ends with' }), value: 'Ends with' }
]

const attributes = {
  paging: { totalCount: 8, page: 1, pageSize: 8, pageCount: 1 },
  content: [
    {
      id: 11,
      name: 'Wireless Network "SSID"',
      description: 'A regular expression defining the Wi-Fi SSID(s) to limit the this policy.',
      attributeTextMatch: 'SSID',
      attributeType: 'STRING'
    },
    {
      id: 12,
      name: 'NAS Identifier',
      description: 'A regular expression defining the NAS Identifier(s) to limit this policy.',
      attributeTextMatch: 'NAS-Identifier',
      attributeType: 'STRING'
    },
    {
      id: 13,
      name: 'Radius User Name',
      description: 'A regular expression defining the User-Name(s) to limit this policy. ' +
        'Could be name, could be realm.',
      attributeTextMatch: 'User-Name',
      attributeType: 'regex'
    }
  ]
}

export function AccessConditionDrawer (props: RadiusAttributeDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { visible, setVisible, isEdit = false, setAccessCondition, editCondition } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)

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
          options={attributes.content.map(p => ({ label: p.name, value: p.id }))}
          onChange={(value) => {
            const attr = attributes.content.find((attribute) => attribute.id === value)
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
