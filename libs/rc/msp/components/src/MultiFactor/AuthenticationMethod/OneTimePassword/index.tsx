import { useState } from 'react'

import { Form, Input, Radio, Space, Typography } from 'antd'
import { useIntl }                               from 'react-intl'
import styled                                    from 'styled-components/macro'

import { cssNumber, Drawer } from '@acx-ui/components'
import { PhoneInput }        from '@acx-ui/rc/components'
import {
  phoneRegExp,
  emailRegExp
} from '@acx-ui/rc/utils'
import { MFAMethod, useMfaRegisterAdminMutation } from '@acx-ui/user'

import { VerifyCodeModal } from '../VerifyCodeModal'

import * as UI from './styledComponents'

interface OneTimePasswordProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  userId: string;
}

export interface OTPMethodProps {
  userId: string;
  type: MFAMethod;
  data: string;
}

export const OneTimePassword = styled((props: OneTimePasswordProps) => {
  const { $t } = useIntl()
  const { className, visible, setVisible, userId } = props
  const [verifyModalVisible, setVerifyModalVisible] = useState(false)
  const [verifyCodeData, setVerifyCodeData] = useState<OTPMethodProps>({} as OTPMethodProps)
  const [form] = Form.useForm()

  const [mfaRegisterAdmin] = useMfaRegisterAdminMutation()

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
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleVerifyModalCancel = () => {
    setVerifyCodeData({} as OTPMethodProps)
    setVerifyModalVisible(false)
  }

  const footer = <Drawer.FormFooter
    buttonLabel={{ save: $t({ defaultMessage: 'Verify' }) }}
    onCancel={onClose}
    onSave={async () => form.submit()}
  />

  return (
    <>
      <Drawer
        className={className}
        title={$t({ defaultMessage: 'OTP Authentication' })}
        visible={visible}
        onClose={onClose}
        footer={footer}
        destroyOnClose
        width={336}
      >
        <Form
          layout='vertical'
          form={form}
          onFinish={handleSubmit}
        >
          <Space
            direction='vertical'
            size={cssNumber('--acx-content-vertical-space')}
          >
            <label >
              { $t({ defaultMessage: 'Manage OTP (One-Time Password) delivery options:' }) }
            </label>
            <Form.Item
              name='otpSelection'
              initialValue={MFAMethod.EMAIL}
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Space direction='vertical' size={0}>
                  <Radio
                    value={MFAMethod.SMS}
                  >
                    <Typography.Text>
                      { $t({ defaultMessage: 'Text Message (SMS)' }) }
                    </Typography.Text>
                    <Form.Item
                      noStyle
                      dependencies={['otpSelection']}
                    >
                      {({ getFieldValue }) => {
                        return getFieldValue('otpSelection') === MFAMethod.SMS ? (
                          <Form.Item
                            name='mobilePhoneNumber'
                            rules={[
                              { required: true },
                              { validator: (_, value) => phoneRegExp(value) }
                            ]}
                            initialValue={''}
                          >
                            <PhoneInput
                              name={'mobilePhoneNumber'}
                              callback={(value) => form.setFieldValue('mobilePhoneNumber', value)}
                              onTop={false}
                            />
                          </Form.Item>):''
                      }}
                    </Form.Item>
                  </Radio>
                  <Radio
                    value={MFAMethod.EMAIL}
                  >
                    <Typography.Text>
                      { $t({ defaultMessage: 'Email' }) }
                    </Typography.Text>
                    <Form.Item
                      noStyle
                      dependencies={['otpSelection']}
                    >
                      {({ getFieldValue }) => {
                        return getFieldValue('otpSelection') === MFAMethod.EMAIL ? (
                          <Form.Item
                            name='email'
                            rules={[
                              { required: true },
                              { validator: (_, value) => emailRegExp(value) }
                            ]}
                            initialValue={''}
                            children={
                              <Input />
                            }
                          />) : ''
                      }}
                    </Form.Item>
                  </Radio>

                </Space>
              </Radio.Group>
            </Form.Item>
          </Space>
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
})`${UI.OTPDrawerStyle}`
