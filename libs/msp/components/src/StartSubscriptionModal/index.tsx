
import { useState } from 'react'

import { DatePicker, Form, Modal } from 'antd'
import moment                      from 'moment-timezone'
import { useIntl }                 from 'react-intl'

interface StartSubscriptionModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  setStartDate: (startDate: Date) => void
}

export const StartSubscriptionModal = (props: StartSubscriptionModalProps) =>{
  const { $t } = useIntl()
  const { visible, setVisible, setStartDate } = props
  const [disabledButton, disableButton] = useState(true)

  const [form] = Form.useForm()
  const formContent = <Form
    form={form}
    onFieldsChange={() => {
      const { startDate } = form.getFieldsValue()
      !startDate ? disableButton(true) : disableButton(false)
    }}
    onFinish={() => {
      setVisible(false)}
    }
  >
    <Form.Item labelAlign='left'
      label={<>
        {$t({ defaultMessage: 'This will start utilizing paid Subscription.' })}<br/>
        {$t({ defaultMessage: 'Are you sure you want to start using Subscription?' })}
      </>}
    >
    </Form.Item>

    <Form.Item
      name='startDate'
      label='Start Paid Subscription on'
      style={{ marginTop: '50px' }}
      children={<DatePicker
        format='MM/DD/YYYY'
        disabledDate={(current) => {
          return moment().add(-1, 'days') >= current
        }}
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

