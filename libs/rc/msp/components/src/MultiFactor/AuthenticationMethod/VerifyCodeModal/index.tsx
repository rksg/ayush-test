import { useState } from 'react'

import { Form, Input, Button } from 'antd'
import { FieldData }           from 'rc-field-form/lib/interface'
import { useIntl }             from 'react-intl'

import { Modal }               from '@acx-ui/components'
import {
  MFAMethod,
  useMfaResendOTPMutation,
  useSetupMFAAccountMutation
} from '@acx-ui/user'

import { OTPMethodProps } from '../OneTimePassword'

interface VerifyCodeModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void,
  data: OTPMethodProps
}

export const VerifyCodeModal = (props: VerifyCodeModalProps) =>{
  const { visible, onCancel, data, onSuccess } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [failedMessage, setFailedMessage] = useState('')

  const [setupMFAAccount, { isLoading: isVerifying }] = useSetupMFAAccountMutation()
  const [ resendOPT, { isLoading: isResending }] = useMfaResendOTPMutation()

  const handleFieldsChange = (changedFields: FieldData[]) => {
    const value = changedFields[0].value
    const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)
    setIsValid(value && !hasErrors)
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue()
    const { verificationCode } = formValues

    let payload = {
      contactId: data.data,
      method: data.type,
      otp: verificationCode
    }

    try {
      await setupMFAAccount({
        params: {
          userId: data.userId
        },
        payload
      }).unwrap()

      onSuccess()
    } catch {
      // eslint-disable-next-line max-len
      setFailedMessage($t({ defaultMessage: 'Looks like you entered an incorrect code. Please try again.' }))
    }
  }

  const handleResend = async () => {
    try {
      await resendOPT({
        params: {
          userId: data.userId
        }
      }).unwrap()
    } catch {
      setFailedMessage($t({ defaultMessage: 'Resend verification error. Please try again.' }))
    }
  }

  const handleCancel = () => {
    onCancel()
    setFailedMessage('')
    setIsValid(false)
    form.resetFields()
  }

  return (
    <Modal
      title={data.type === MFAMethod.EMAIL ?
        $t({ defaultMessage: 'Verify your Email Address' }) :
        $t({ defaultMessage: 'Verify your Mobile Number' })}
      width={496}
      visible={visible}
      okText={$t({ defaultMessage: 'Verify' })}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okButtonProps={{
        disabled: !isValid || isVerifying || isResending
      }}
    >
      <Form
        form={form}
        layout='vertical'
        onFieldsChange={handleFieldsChange}
        onFinish={handleSubmit}
      >
        <Form.Item
          label={
            $t({ defaultMessage: 'Enter the verification code that was sent to {contactID}' }
              , { contactID: data.data })
          }
          name='verificationCode'
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'Please enter verification code' })
            }
          ]}
          {...(isValid && failedMessage !== '' ? {
            validateStatus: 'error',
            help: failedMessage
          } : undefined)}

        >
          <Input style={{ width: '210px' }} />
        </Form.Item>
        <div style={{ marginTop: '30px', marginBottom: '25px' }}>
          <label>
            {$t({ defaultMessage: 'Didn’t get it?' })}
          </label>
          <Button
            type='link'
            disabled={isResending}
            onClick={handleResend}
            style={{ color: 'var(--acx-accents-blue-50)' }}
          >
            {$t({ defaultMessage: 'Resend' })}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

