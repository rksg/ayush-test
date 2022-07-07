import { useState } from 'react'

import { Modal }  from '..'
import { Button } from '../../Button'

export function FormModal () {
  const [visible, setVisible] = useState(false)
  
  const content = <>
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </>

  const showModal = () => {
    setVisible(true)
  }

  const handleConfirm = () => {
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const footer = [
    <Button key='cancel' onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key='confirm' type='primary' onClick={handleConfirm}>
      Confirm
    </Button>
  ]

  return (
    <>
      <Button onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title='Form Modal'
        visible={visible}
        footer={footer}
        closable={false}
        width={600}
      >
        {content}
      </Modal>
    </>
  )  
}
