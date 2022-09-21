import { useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }             from 'react-intl'

import { Drawer, DrawerFormFooter } from '@acx-ui/components'
import { MdnsProxyForwardingRule }  from '@acx-ui/rc/utils'


export interface MdnsProxyForwardingRuleDrawerProps {
  rule?: MdnsProxyForwardingRule;
  setRule: (r: MdnsProxyForwardingRule) => void;
  editMode: boolean;
  visible: boolean;
  setVisible: (v: boolean) => void;
}

export function MdnsProxyForwardingRuleDrawer (props: MdnsProxyForwardingRuleDrawerProps) {
  const { $t } = useIntl()
  const [ addAnotherRuleChecked, setAddAnotherRuleChecked ] = useState(false)
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
    setAddAnotherRuleChecked(false)
  }

  const onAddAnotherRuleChange = (e: CheckboxChangeEvent) => {
    setAddAnotherRuleChecked(e.target.checked)
  }

  const content = <Form layout='vertical'
    form={form}
    onFinish={(data: MdnsProxyForwardingRule) => {
      setRule(data)

      if (addAnotherRuleChecked) {
        form.resetFields()
      } else {
        onClose()
      }
    }}>
    <Form.Item
      label={$t({ defaultMessage: 'Type' })}
      name='type'
    >
      <Select
        placeholder={$t({ defaultMessage: 'Select Type...' })}
      >
        {
          // Mocked option data for development purpose, will get options by the API later
          <>
            <Option key='AirPlay'>AirPlay</Option>
            <Option key='AirPrint'>AirPrint</Option>
            <Option key='AirTv'>Air TV</Option>
          </>
        }
      </Select>
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
      forceRender // Avoid the form (in childre prop) not been rendered when operating
      footer={
        <DrawerFormFooter
          showAddAnother={!editMode}
          addAnotherChecked={addAnotherRuleChecked}
          addAnotherText={$t({ defaultMessage: 'Add another rule' })}
          onAddAnotherChange={onAddAnotherRuleChange}
          saveText={editMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })}
          onCancel={onClose}
          onSave={() => form.submit()}
        />
      }
      width={'400px'}
    />
  )
}
