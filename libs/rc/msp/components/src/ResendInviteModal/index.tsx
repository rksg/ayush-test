
import { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal }                         from '@acx-ui/components'
import { useResendEcInvitationMutation } from '@acx-ui/msp/services'
import { emailRegExp }                   from '@acx-ui/rc/utils'

interface ResendInviteModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  tenantId: string
}

export const ResendInviteModal = (props: ResendInviteModalProps) =>{
  const { $t } = useIntl()
  const { visible, setVisible, tenantId } = props
  const [disabledResendButton, disableButton] = useState(true)

  const [form] = Form.useForm()

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onChange'
    onFieldsChange={() => {
      const { email } = form.getFieldsValue()
      const hasErrors = form.getFieldsError().map(item => item.errors).flat().length > 0
      !(email && !hasErrors ) ? disableButton(true) : disableButton(false)
    }}
  >
    <Form.Item
      label={$t({ defaultMessage:
        'Enter the email of the administrator you need to re-send an invitation to:' })}
      name='email'
      rules={[
        { validator: (_, value) => emailRegExp(value) }
      ]}
    >
      {<Input />}
    </Form.Item>
  </Form>

  const [
    resendInvitation
    // { isLoading: isDeleteEcUpdating }
  ] = useResendEcInvitationMutation()

  const handleOk = () => {
    const { email } = form.getFieldsValue()
    const payload = {
      admin_email: email,
      resend: true
    }
    resendInvitation({ payload, params: { mspEcTenantId: tenantId } })
      .then(() => {
        setVisible(false)
        form.resetFields()
      })
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Resend Invitation' })}
      width={400}
      visible={visible}
      okText={$t({ defaultMessage: 'Resend Invitation' })}
      onCancel={handleCancel}
      onOk={handleOk}
      maskClosable={false}
      okButtonProps={{
        disabled: disabledResendButton
      }}
    >
      {formContent}
    </Modal>
  )
}

