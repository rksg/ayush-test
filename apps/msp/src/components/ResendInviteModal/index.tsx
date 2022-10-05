
import { Form, Input, Modal } from 'antd'
import { useIntl }            from 'react-intl'

interface ResendInviteModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const ResendInviteModal = (props: ResendInviteModalProps) =>{
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const [form] = Form.useForm()

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onBlur'
    onFinish={() => setVisible(false)}
  >
    <Form.Item
      label={$t({ defaultMessage:
        'Enter the email of the administrator you need to re-send an invitation to:' })}
      name='Name'
      rules={[{ message: $t({ defaultMessage: 'Please input your Email!' }) }]}
    >
      <Input placeholder='Input Email' />
    </Form.Item>
  </Form>

  const handleOk = () => {
    form.submit()
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Modal
      title=' '
      width={350}
      visible={visible}
      okText={$t({ defaultMessage: 'Resend Invitaion' })}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      {formContent}
    </Modal>
  )
}

