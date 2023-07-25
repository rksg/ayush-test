/* eslint-disable max-len */
import { useEffect } from 'react'

import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Alert, Tooltip }                            from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                        from '@acx-ui/icons'
import { validateDuplicateVlanName, validateVlanName, Vlan } from '@acx-ui/rc/utils'

export interface ACLSettingDrawerProps {
  defaultVlan?: Vlan
  setDefaultVlan: (r: Vlan) => void
  visible: boolean
  setVisible: (v: boolean) => void
  isRuleUnique?: (r: Vlan) => boolean
  vlansList: Vlan[]
}

export function DefaultVlanDrawer (props: ACLSettingDrawerProps) {
  const { $t } = useIntl()
  const { defaultVlan, setDefaultVlan, visible, setVisible, vlansList } = props
  const form = Form.useFormInstance<Vlan>()

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Default VLAN settings' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <DefaultVlanForm
          form={form}
          defaultVlan={defaultVlan}
          setDefaultVlan={setDefaultVlan}
          vlansList={vlansList}
        />
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Save' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
              onClose()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

interface DefaultVlanFormProps {
  form: FormInstance<Vlan>
  defaultVlan?: Vlan
  setDefaultVlan: (r: Vlan) => void
  vlansList: Vlan[]
}

function DefaultVlanForm (props: DefaultVlanFormProps) {
  const { Option } = Select
  const { $t } = useIntl()
  const { form, defaultVlan, setDefaultVlan, vlansList } = props

  useEffect(() => {
    if(defaultVlan){
      form.setFieldsValue(defaultVlan)
    //   setRuleList(defaultVlan.aclRules as AclStandardRule[] | AclExtendedRule[])
    }
  }, [form, defaultVlan])

  const onSaveVlan = (values: Vlan) => {
    values.title = `Default VLAN (${values.vlanId}) settings`
    setDefaultVlan(values)
  }

  return (
    <Form
      layout='vertical'
      form={form}
      onFinish={(data: Vlan) => {
        onSaveVlan(data)
        form.resetFields()
      }}
    >
      <Alert type='info' message={$t({ defaultMessage: 'Default VLAN change will be applied to all the switches linked to this profile. Changing the default VLAN may cause network disruption unless the VLAN-ID already exists on the switch(es)' })} />
      <Form.Item
        label={<>
          {$t({ defaultMessage: 'VLAN ID' })}
          <Tooltip
            title={$t({
              defaultMessage: 'Default VLAN settings won\'t be applied if there is the same VLAN ID in switch'
            })}
            placement='bottom'
          >
            <QuestionMarkCircleOutlined />
          </Tooltip>
        </>}
        name='vlanId'
        rules={[
          { required: true },
          { validator: (_, value) => validateVlanName(value) },
          { validator: (_, value) => validateDuplicateVlanName(value, vlansList) }
        ]}
        children={<InputNumber />}
      />
      <Form.Item
        name='spanningTreeProtocol'
        label={$t({ defaultMessage: 'Spanning tree protocol' })}
        initialValue={defaultVlan?.spanningTreeProtocol || 'stp'}
        children={
          <Select>
            <Option value={'rstp'}>
              {$t({ defaultMessage: 'RSTP' })}</Option>
            <Option value={'stp'}>
              {$t({ defaultMessage: 'STP' })}</Option>
            <Option value={'none'}>
              {$t({ defaultMessage: 'NONE' })}</Option>
          </Select>
        }
      />
      <Form.Item
        name='vlanName'
        initialValue={'DEFAULT-VLAN'}
        hidden={true}
        children={<Input />}
      />
    </Form>
  )
}
