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
    <Button key='cancel'size='large' onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key='add' size='large' type='primary' onClick={handleConfirm}>
      Add
    </Button>
  ]

  return (
    <>
      <Button onClick={showModal}>
        Form Modal
      </Button>
      <Modal
        title='Form Modal'
        visible={visible}
        footer={footer}
        width={800}
      >
        {content}
      </Modal>
    </>
  )  
}
