
import { useState } from 'react'

import { DatePicker, Form, Modal } from 'antd'
import { useIntl }                 from 'react-intl'

interface StartSubscriptionModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  setStartDate: (startDate: Date) => void
}

export const StartSubscriptionModal = (props: StartSubscriptionModalProps) =>{
  const { $t } = useIntl()
  const { visible, setVisible, setStartDate } = props
  const [disabledButton, disableButton] = useState(false)

  const [form] = Form.useForm()
  const formContent = <Form
    form={form}
    onFieldsChange={() => {
      const { start } = form.getFieldsValue()
      const hasErrors = form.getFieldsError().map(item => item.errors).flat().length > 0
      !(start && !hasErrors ) ? disableButton(false) : disableButton(false)
    }}
    onFinish={() => {
      setVisible(false)}
    }
  >
    <div><label>
      {$t({ defaultMessage: 'This will start utilizing paid Subscription.' })}</label>
    </div>
    <label>
      {$t({ defaultMessage: 'Are you sure you want to start using Subscription?' })}</label>

    <Form.Item
      name='startDate'
      label='Start Paid Subscription on'
      style={{ marginTop: '45px' }}
      children={<DatePicker
        format='MM/DD/YYYY'
        style={{ marginLeft: '4px', width: '150px' }}
      />}
    />
  </Form>

  const handleOk = () => {
    const { startDate } = form.getFieldsValue()
    setStartDate(startDate)
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Start Subscription' })}
      width={400}
      visible={visible}
      okText={$t({ defaultMessage: 'Start Subscription' })}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      okButtonProps={{
        disabled: disabledButton
      }}
    >
      {formContent}
    </Modal>
  )
}

