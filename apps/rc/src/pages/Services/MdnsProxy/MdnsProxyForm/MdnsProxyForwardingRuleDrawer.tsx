import { useEffect } from 'react'

import { Form, Input, InputNumber, Select } from 'antd'
import { useIntl }                          from 'react-intl'

import { Drawer }                                                   from '@acx-ui/components'
import { MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'
import { validationMessages }                                       from '@acx-ui/utils'

import { mdnsProxyForwardingRuleTypeLabelMapping as ruleTypeLabelMapping } from '../../contentsMap'

export interface MdnsProxyForwardingRuleDrawerProps {
  rule?: MdnsProxyForwardingRule;
  setRule: (r: MdnsProxyForwardingRule) => void;
  editMode: boolean;
  visible: boolean;
  setVisible: (v: boolean) => void;
  isRuleUnique?: (r: MdnsProxyForwardingRule) => boolean
}

export function MdnsProxyForwardingRuleDrawer (props: MdnsProxyForwardingRuleDrawerProps) {
  const { $t } = useIntl()
  const {
    rule = {},
    setRule,
    visible,
    setVisible,
    editMode,
    isRuleUnique = () => true
  } = props
  const [ form ] = Form.useForm<MdnsProxyForwardingRule>()
  const { Option } = Select

  useEffect(() => {
    form.setFieldsValue(rule)
  }, [form, rule])

  const onClose = () => {
    setVisible(false)
  }

  const ruleDuplicationValidator = async () => {
    const values: MdnsProxyForwardingRule = form.getFieldsValue()
    return isRuleUnique(values)
      ? Promise.resolve()
      // eslint-disable-next-line max-len
      : Promise.reject($t({ defaultMessage: 'Rule with same Type and VLAN IDs already exists' }))
  }

  const vlanDuplicationValidator = async () => {
    const toVlan = form.getFieldValue('toVlan')
    const fromVlan = form.getFieldValue('fromVlan')
    return (toVlan && toVlan === fromVlan)
      ? Promise.reject($t({ defaultMessage: 'From VLAN and To VLAN must be different' }))
      : Promise.resolve()
  }

  const content = <Form layout='vertical'
    form={form}
    onFinish={(data: MdnsProxyForwardingRule) => {
      setRule(data)
      form.resetFields()
    }}>
    <Form.Item name='id' noStyle>
      <Input type='hidden' />
    </Form.Item>
    <Form.Item
      label={$t({ defaultMessage: 'Type' })}
      name='type'
      dependencies={['toVlan', 'fromVlan']}
      rules={[
        {
          required: true
        },
        {
          validator: () => ruleDuplicationValidator()
        }
      ]}
    >
      <Select
        placeholder={$t({ defaultMessage: 'Select Type...' })}
        children={
          Object.keys(ruleTypeLabelMapping).map((key) => {
            return (
              <Option key={key}>
                {$t(ruleTypeLabelMapping[key as MdnsProxyForwardingRuleTypeEnum])}
              </Option>
            )
          })
        }
      />
    </Form.Item>
    <Form.Item
      name='fromVlan'
      label={$t({ defaultMessage: 'From VLAN' })}
      dependencies={['toVlan']}
      rules={[
        {
          required: true
        },
        {
          type: 'number',
          min: 1,
          max: 4094,
          message: $t(validationMessages.vlanRange)
        },
        {
          validator: () => vlanDuplicationValidator()
        }
      ]}
      children={<InputNumber />}
    />
    <Form.Item
      name='toVlan'
      label={$t({ defaultMessage: 'To VLAN' })}
      dependencies={['fromVlan']}
      rules={[
        {
          required: true
        },
        {
          type: 'number',
          min: 1,
          max: 4094,
          message: $t(validationMessages.vlanRange)
        },
        {
          validator: () => vlanDuplicationValidator()
        }
      ]}
      children={<InputNumber />}
    />
  </Form>

  return (
    <Drawer
      title={editMode
        ? $t({ defaultMessage: 'Edit Rule' })
        : $t({ defaultMessage: 'Add Rule' })
      }
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={!editMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another rule' }),
            save: editMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={async (addAnotherRuleChecked: boolean) => {
            try {
              await form.validateFields()
              form.submit()

              if (!addAnotherRuleChecked) {
                onClose()
              }
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      width={'400px'}
    />
  )
}
