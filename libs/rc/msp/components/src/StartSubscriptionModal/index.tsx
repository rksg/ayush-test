import { useIntl } from 'react-intl'

import { Modal } from '@acx-ui/components'

interface StartSubscriptionModalProps {
  isActive: boolean
  visible: boolean
  setVisible: (visible: boolean) => void
  setStartDate: (startDate: Date) => void
}

export const StartSubscriptionModal = (props: StartSubscriptionModalProps) =>{
  const { $t } = useIntl()
  const { isActive, visible, setVisible, setStartDate } = props

  const Content = () => {
    if (isActive) {
      return <>
        <div style={{ marginBottom: '15px' }}>
          <label>
            {$t({ defaultMessage: 'This will stop the Trial Mode and start utilizing paid' })}
          </label><br/>
          <label>{$t({ defaultMessage: 'Subscription.' })}</label><br/>
        </div>
        <div style={{ marginBottom: '35px' }}><label>
          {$t({ defaultMessage: 'Are you sure you want to start using Subscription?' })}
        </label></div>
      </>
    } else {
      return <div style={{ marginBottom: '35px' }}>
        <label>
          {$t({ defaultMessage: 'This will start utilizing paid Subscription.' })}
        </label><br/>
        <label>
          {$t({ defaultMessage: 'Are you sure you want to start using Subscription?.' })}
        </label>
      </div>
    }
  }

  const handleOk = () => {
    const today = new Date()
    setStartDate(today)
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
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
    >
      {<Content/>}
    </Modal>
  )
}

