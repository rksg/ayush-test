import { useState } from 'react'

import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import {
  Drawer
} from '@acx-ui/components'

import {
  VerifyCodeModal
} from '../VerifyCodeModal'

interface OneTimePasswordProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const OneTimePassword = (props: OneTimePasswordProps) => {
  const { $t } = useIntl()

  const { visible, setVisible } = props
  const [resetField, setResetField] = useState(false)
  const [modalVisible, setModalVisible] = useState(true)
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const handleSave = () => {
    setVisible(false)
  }

  //   form.setFieldValue('result', recoveryCode)

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
      <Radio.Group >
        <Space direction='vertical'>
          <Radio value={false} disabled={false}>
            { $t({ defaultMessage: 'Text Message (SMS)' }) }
          </Radio>
          <Radio style={{ marginTop: '10px' }} value={true} disabled={false}>
            { $t({ defaultMessage: 'Email' }) }
          </Radio>
        </Space>
      </Radio.Group>
    </Form.Item>


  </Form>

  const footer = [
    <Drawer.FormFooter
      onCancel={resetFields}
      onSave={async () => handleSave()}
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
