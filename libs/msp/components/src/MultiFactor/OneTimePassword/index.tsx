import { useState } from 'react'

import { Form, Input, Radio, RadioChangeEvent, Space } from 'antd'
import { PhoneNumberUtil }                             from 'google-libphonenumber'
import { useIntl }                                     from 'react-intl'

import { Drawer } from '@acx-ui/components'
import {
  phoneRegExp,
  emailRegExp
} from '@acx-ui/rc/utils'

import { VerifyCodeModal } from '../VerifyCodeModal'

interface OneTimePasswordProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const OneTimePassword = (props: OneTimePasswordProps) => {
  const { $t } = useIntl()

  const { visible, setVisible } = props
  const [resetField, setResetField] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [smsSelected, setSmsSelected] = useState(false)
  const [form] = Form.useForm()

  const examplePhoneNumber = PhoneNumberUtil.getInstance().getExampleNumber('US')

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const handleVerify = () => {
    setModalVisible(true)
  }

  const onChange = (e: RadioChangeEvent) => {
    setSmsSelected(e.target.value)
  }

  const content =
  <Form layout='vertical' form={form} onFinish={onClose}>
    <div/><label >
      { $t({ defaultMessage: 'Manage OTP (One-Time Password) delivery options:' }) }
    </label>
    <Form.Item
      name='otpSelection'
      initialValue={false}
      style={{ marginTop: '20px' }}
    >
      <Radio.Group onChange={onChange}>
        <Space direction='vertical'>
          <Radio value={true} disabled={false}>
            { $t({ defaultMessage: 'Text Message (SMS)' }) }
          </Radio>
          {smsSelected && <Form.Item
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
                // onChange={onPhoneNumberChange}
              />
            }
          />}
          <Radio style={{ marginTop: '5px' }} value={false} disabled={false}>
            { $t({ defaultMessage: 'Email' }) }
          </Radio>
          {!smsSelected && <Form.Item
            name='email'
            rules={[
              { validator: (_, value) => emailRegExp(value) }
            ]}
            initialValue={''}
            children={
              <Input
                style={{ marginLeft: '16px', marginTop: '5px', width: '207px' }}
                // onChange={onEmailChange}
              />
            }
          />}
        </Space>
      </Radio.Group>
    </Form.Item>
  </Form>

  const footer = [
    <Drawer.FormFooter
      buttonLabel={{ save: $t({ defaultMessage: 'Verify' }) }}
      onCancel={resetFields}
      onSave={async () => handleVerify()}
    />
  ]

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'OTP Authentication' })}
        visible={visible}
        onClose={onClose}
        children={content}
        footer={footer}
        destroyOnClose={resetField}
        width={'336'}
      />
      <VerifyCodeModal
        visible={modalVisible}
        setVisible={setModalVisible}
        // tenantId={tenantId}
      />
    </>
  )
}
