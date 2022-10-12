import { useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer }                                                   from '@acx-ui/components'
import { MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'

import { mdnsProxyForwardingRuleTypeLabelMapping as ruleTypeLabelMapping } from '../../contentsMap'

export interface MdnsProxyForwardingRuleDrawerProps {
  rule?: MdnsProxyForwardingRule;
  setRule: (r: MdnsProxyForwardingRule) => void;
  editMode: boolean;
  visible: boolean;
  setVisible: (v: boolean) => void;
}

export function MdnsProxyForwardingRuleDrawer (props: MdnsProxyForwardingRuleDrawerProps) {
  const { $t } = useIntl()
  const { rule = {}, setRule, visible, setVisible, editMode } = props
  const [ form ] = Form.useForm<MdnsProxyForwardingRule>()
  const { Option } = Select

  useEffect(() => {
    form.setFieldsValue(rule)

    return () => {
      form.resetFields()
    }
  }, [form, rule])

  const onClose = () => {
    setVisible(false)
  }

  const content = <Form layout='vertical'
    form={form}
    onFinish={(data: MdnsProxyForwardingRule) => {
      setRule(data)
      form.resetFields()
    }}>
    <Form.Item
      label={$t({ defaultMessage: 'Type' })}
      name='type'
      rules={[
        { required: true }
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
      rules={[
        { required: true }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='toVlan'
      label={$t({ defaultMessage: 'To VLAN' })}
      rules={[
        { required: true }
      ]}
      children={<Input />}
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
      children={content}
      forceRender // Avoid the form (in children prop) not been rendered when operating
      footer={
        <Drawer.FormFooter
          showAddAnother={!editMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another rule' }),
            save: editMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={(addAnotherRuleChecked: boolean) => {
            form.submit()

            if (!addAnotherRuleChecked) {
              onClose()
            }
          }}
        />
      }
      width={'400px'}
    />
  )
}
