import { useState } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { PhoneNumberUtil }           from 'google-libphonenumber'
import { useIntl }                   from 'react-intl'

import { Drawer, showToast }           from '@acx-ui/components'
import { useMfaRegisterAdminMutation } from '@acx-ui/rc/services'
import {
  phoneRegExp,
  emailRegExp,
  MFAMethod
} from '@acx-ui/rc/utils'

import { VerifyCodeModal } from '../VerifyCodeModal'

interface OneTimePasswordProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  userId: string;
}

export interface OTPMethodProps {
  userId: string;
  type: MFAMethod;
  data: string;
}

export const OneTimePassword = (props: OneTimePasswordProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, userId } = props
  const [isValid, setIsValid] = useState(false)
  const [verifyModalVisible, setVerifyModalVisible] = useState(false)
  const [verifyCodeData, setVerifyCodeData] = useState<OTPMethodProps>({} as OTPMethodProps)
  const [form] = Form.useForm()

  const [mfaRegisterAdmin] = useMfaRegisterAdminMutation()

  const examplePhoneNumber = PhoneNumberUtil.getInstance().getExampleNumber('US')

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue()
    const { otpSelection, mobilePhoneNumber, email } = formValues

    let payload = {
      contactId: otpSelection === MFAMethod.SMS ? mobilePhoneNumber : email,
      method: otpSelection
    }

    try {
      await mfaRegisterAdmin({
        params: { userId },
        payload
      }).unwrap()

      const otpData:OTPMethodProps = {
        userId,
        type: otpSelection,
        data: otpSelection === MFAMethod.SMS ? mobilePhoneNumber : email
      }

      setVerifyCodeData(otpData)
      setVerifyModalVisible(true)
    } catch {
      // TODO: handle error?
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleVerifyModalCancel = () => {
    setVerifyCodeData({} as OTPMethodProps)
    setVerifyModalVisible(false)
  }

  const handleValuesChange = () => {
    const mobile = form.getFieldValue('mobilePhoneNumber')
    const email = form.getFieldValue('email')
    setIsValid(mobile || email)
  }

  // TODO: use "isValid"
  const footer = [
    <Drawer.FormFooter
      buttonLabel={{ save: $t({ defaultMessage: 'Verify' }) }}
      onCancel={onClose}
      onSave={async () => form.submit()}
    />
  ]

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'OTP Authentication' })}
        visible={visible}
        onClose={onClose}
        footer={footer}
        destroyOnClose
        width={'336'}
      >
        <Form
          layout='vertical'
          form={form}
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
        >
          <div/>
          <label >
            { $t({ defaultMessage: 'Manage OTP (One-Time Password) delivery options:' }) }
          </label>
          <Form.Item
            name='otpSelection'
            initialValue={MFAMethod.EMAIL}
            style={{ marginTop: '20px' }}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Space direction='vertical'>
                <Radio
                  value={MFAMethod.SMS}
                >
                  { $t({ defaultMessage: 'Text Message (SMS)' }) }
                </Radio>
                <Form.Item
                  noStyle
                  dependencies={['otpSelection']}
                >
                  {({ getFieldValue }) => {
                    return getFieldValue('otpSelection') === MFAMethod.SMS ? (
                      <Form.Item
                        name='mobilePhoneNumber'
                        rules={[
                          { validator: (_, value) => phoneRegExp(value) }
                        ]}
                        initialValue={null}
                        children={
                          <Input
                            style={{ marginLeft: '16px', marginTop: '5px', width: '207px' }}
                            // eslint-disable-next-line max-len
                            placeholder={`+${examplePhoneNumber.getCountryCode()} ${examplePhoneNumber.getNationalNumberOrDefault()}`}
                          />
                        }
                      />):''
                  }}
                </Form.Item>

                <Radio
                  style={{ marginTop: '5px' }}
                  value={MFAMethod.EMAIL}
                >
                  { $t({ defaultMessage: 'Email' }) }
                </Radio>
                <Form.Item
                  noStyle
                  dependencies={['otpSelection']}
                >
                  {({ getFieldValue }) => {
                    return getFieldValue('otpSelection') === MFAMethod.EMAIL ? (
                      <Form.Item
                        name='email'
                        rules={[
                          { validator: (_, value) => emailRegExp(value) }
                        ]}
                        initialValue={''}
                        children={
                          <Input
                            style={{ marginLeft: '16px', marginTop: '5px', width: '207px' }}
                          />
                        }
                      />) : ''
                  }}
                </Form.Item>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Drawer>
      <VerifyCodeModal
        visible={verifyModalVisible}
        onCancel={handleVerifyModalCancel}
        onSuccess={onClose}
        data={verifyCodeData}
      />
    </>
  )
}
