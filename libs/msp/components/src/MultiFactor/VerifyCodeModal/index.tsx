
import { useState } from 'react'

import { Form, Input, Modal } from 'antd'
import { useIntl }            from 'react-intl'

import {
  useResendEcInvitationMutation
} from '@acx-ui/rc/services'
import {
  emailRegExp
} from '@acx-ui/rc/utils'


interface VerifyCodeModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
//   tenantId: string
}

export const VerifyCodeModal = (props: VerifyCodeModalProps) =>{
  const { $t } = useIntl()
  const { visible, setVisible } = props
  //   const { visible, setVisible, tenantId } = props
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
    onFinish={() => setVisible(false)}
  >
    <Form.Item
      label={$t({ defaultMessage:
        'Enter the verification code that was sent to' })}
      name='email'
      rules={[
        { validator: (_, value) => emailRegExp(value) },
        { message: $t({ defaultMessage: 'Please enter a valid email address!' }) }
      ]}
    >
      {<Input style={{ width: '210px' }}/>}
    </Form.Item>
    <div style={{ marginTop: '30px', marginBottom: '25px' }}>
      <label >Didn't get it? </label>
      <label style={{ cursor: 'pointer', color: 'var(--acx-accents-blue-50)' }}
        onClick={()=>(true)}
      >Resend</label>
    </div>
  </Form>

  const [
    // resendInvitation
    // { isLoading: isDeleteEcUpdating }
  ] = useResendEcInvitationMutation()

  const handleOk = () => {
    // const { email } = form.getFieldsValue()
    // const payload = {
    //   admin_email: email,
    //   resend: false
    // }
    // resendInvitation({ payload, params: { mspEcTenantId: tenantId } })
    //   .then(() => {
    //     setVisible(false)
    //     form.resetFields()
    //   })
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Verify your Email Address' })}
      width={496}
      visible={visible}
      okText={$t({ defaultMessage: 'Verify' })}
      onCancel={handleCancel}
      onOk={handleOk}
      okButtonProps={{
        disabled: disabledResendButton
      }}
    >
      {formContent}
    </Modal>
  )
}

