import { useState } from 'react'

import { Form, Typography } from 'antd'
import TextArea             from 'antd/lib/input/TextArea'
import { useIntl }          from 'react-intl'

import {
  Drawer
} from '@acx-ui/components'

interface RecoveryCodeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  recoveryCode: string[]
}

export const RecoveryCodes = (props: RecoveryCodeDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, recoveryCode } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()
  const { Paragraph } = Typography

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

  form.setFieldValue('result', recoveryCode.join('\n'))

  const content =
  <Form layout='vertical' form={form} onFinish={onClose}>
    <label >
      { $t({ defaultMessage: 'These codes can be used to access your account if you have ' +
      'trouble receiving the security code on phone. Make sure you copy them and store them ' +
      'in a safe place.' }) }
    </label>
    <Form.Item
      name='result'>
      <TextArea
        style={{
          fontSize: '12px',
          resize: 'none',
          marginTop: '15px',
          height: '104px',
          borderRadius: '4px'
        }}
        autoSize={false}
        readOnly={true}
      />
    </Form.Item>
    <label style={{ marginTop: '-12px', float: 'right' }}>
      <Paragraph copyable>Copy Codes</Paragraph>
    </label>
  </Form>

  const footer = [
    <Drawer.FormFooter
      buttonLabel={{ save: $t({ defaultMessage: 'Ok' }) }}
      onCancel={resetFields}
      onSave={async () => handleSave()}
    />
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: 'Recovery Codes' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={'336'}
    />
  )
}
