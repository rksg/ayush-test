import React from 'react'

import { Form, Input } from 'antd'

import { Modal }                                        from '@acx-ui/components'
import { syslogServerRegExp, VenueSwitchConfiguration } from '@acx-ui/rc/utils'
import { getIntl }                                      from '@acx-ui/utils'

import { FormState } from './index'

export function SyslogServerModal (props: {
  formState: FormState,
  formData: VenueSwitchConfiguration,
  setFormState: (data: FormState) => void,
  setFormData: (data: VenueSwitchConfiguration) => void
}) {
  const { $t } = getIntl()
  const { formState, setFormState, formData, setFormData } = props
  const [form] = Form.useForm()

  const onOk = async () => {
    try {
      const valid = await form.validateFields()
      if (valid) {
        setFormState({ ...formState, syslogModalvisible: false })
        setFormData({ ...formData, ...form.getFieldsValue(), syslogEnabled: true })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return <Modal
    title={$t({ defaultMessage: 'Syslog Server Configuration' })}
    visible={formState?.syslogModalvisible}
    destroyOnClose={true}
    onOk={onOk}
    onCancel={() => {
      setFormState({
        ...formState,
        syslogModalvisible: false
      })
    }}
  >
    <Form
      form={form}
      layout='vertical'
      validateTrigger='onBlur'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Server 1 IP Address' })}
        name='syslogPrimaryServer'
        rules={[
          { required: true },
          { validator: (_, value) => syslogServerRegExp(value) }
        ]}
        initialValue={formData.syslogPrimaryServer}
        validateFirst
        children={<Input />}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Server 2 IP Address' })}
        name='syslogSecondaryServer'
        rules={[
          { validator: (_, value) => syslogServerRegExp(value) }
        ]}
        initialValue={formData.syslogSecondaryServer}
        children={<Input />}
      />
    </Form>
  </Modal>
}