import { useEffect } from 'react'

import { Form, FormInstance, Input, InputNumber, Select } from 'antd'
import { FormattedMessage, useIntl }                      from 'react-intl'

import { Drawer, Tooltip }        from '@acx-ui/components'
import {
  MdnsProxyForwardingRule,
  BridgeServiceEnum,
  BridgeServiceProtocolEnum,
  mdnsProxyRuleTypeLabelMapping
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

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
    rule,
    setRule,
    visible,
    setVisible,
    editMode,
    isRuleUnique
  } = props
  const [ form ] = Form.useForm<MdnsProxyForwardingRule>()

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={editMode
        ? $t({ defaultMessage: 'Edit Rule' })
        : $t({ defaultMessage: 'Add Rule' })
      }
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <ForwardingRuleForm
          form={form}
          rule={rule}
          setRule={setRule}
          isRuleUnique={isRuleUnique}
        />
      }
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


interface ForwardingRuleFormProps {
  form: FormInstance<MdnsProxyForwardingRule>;
  rule?: MdnsProxyForwardingRule;
  setRule: (r: MdnsProxyForwardingRule) => void;
  isRuleUnique?: (r: MdnsProxyForwardingRule) => boolean
}

function ForwardingRuleForm (props: ForwardingRuleFormProps) {
  const { $t } = useIntl()
  const {
    form,
    rule = {},
    setRule,
    isRuleUnique = () => true
  } = props
  const { Option } = Select
  const serviceType = Form.useWatch('service', form)

  useEffect(() => {
    form.setFieldsValue(rule)
  }, [form, rule])

  const ruleDuplicationValidator = async () => {
    return isRuleUnique(form.getFieldsValue())
      ? Promise.resolve()
      : Promise.reject($t({ defaultMessage: 'Rule with same Type and VLAN IDs already exists' }))
  }

  const vlanDuplicationValidator = async () => {
    const toVlan = form.getFieldValue('toVlan')
    const fromVlan = form.getFieldValue('fromVlan')
    return (toVlan && toVlan === fromVlan)
      ? Promise.reject($t({ defaultMessage: 'From VLAN and To VLAN must be different' }))
      : Promise.resolve()
  }

  return (
    <Form layout='vertical'
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
        name='service'
        dependencies={['toVlan', 'fromVlan']}
        rules={[
          { required: true },
          { validator: () => ruleDuplicationValidator() }
        ]}
      >
        <Select
          placeholder={$t({ defaultMessage: 'Select Type...' })}
          children={
            Object.keys(mdnsProxyRuleTypeLabelMapping).map((key) => {
              return (
                <Option key={key} value={key}>
                  {$t(mdnsProxyRuleTypeLabelMapping[key as BridgeServiceEnum])}
                </Option>
              )
            })
          }
        />
      </Form.Item>
      {serviceType === BridgeServiceEnum.OTHER &&
        <Form.Item
          name='mdnsName'
          label={
            <>
              {$t({ defaultMessage: 'Service Name' })}
              <Tooltip.Question
                placement='bottom'
                title={<FormattedMessage
                  defaultMessage={`The name can only contain between 2 and 64 characters.
                    Only the following characters are allowed: 'a-z', 'A-Z', '0-9',
                    space and other special characters ({specialChars})
                  `}
                  values={{
                    specialChars: '!";#$%\'()*+,-./:;<=>?@[]^_{|}~*&\\`'
                  }}
                />}
              />
            </>
          }
          rules={[
            { required: true },
            { min: 2 },
            { max: 64 }
          ]}
          children={<Input />}
        />
      }
      {serviceType === BridgeServiceEnum.OTHER &&
        <Form.Item
          label={$t({ defaultMessage: 'Transport Protocol' })}
          name='mdnsProtocol'
          rules={[
            { required: true }
          ]}
        >
          <Select>
            <Option key={BridgeServiceProtocolEnum.TCP}>{$t({ defaultMessage: 'TCP' })}</Option>
            <Option key={BridgeServiceProtocolEnum.UDP}>{$t({ defaultMessage: 'UDP' })}</Option>
          </Select>
        </Form.Item>
      }
      <Form.Item
        name='fromVlan'
        label={$t({ defaultMessage: 'From VLAN' })}
        dependencies={['toVlan']}
        rules={[
          { required: true },
          {
            type: 'number',
            min: 1,
            max: 4094,
            message: $t(validationMessages.vlanRange)
          },
          { validator: () => vlanDuplicationValidator() }
        ]}
        children={<InputNumber />}
      />
      <Form.Item
        name='toVlan'
        label={$t({ defaultMessage: 'To VLAN' })}
        dependencies={['fromVlan']}
        rules={[
          { required: true },
          {
            type: 'number',
            min: 1,
            max: 4094,
            message: $t(validationMessages.vlanRange)
          },
          { validator: () => vlanDuplicationValidator() }
        ]}
        children={<InputNumber />}
      />
    </Form>
  )
}
