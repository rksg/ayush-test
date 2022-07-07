import { useState } from 'react'

import { Modal }  from '..'
import { Button } from '../../Button'

export function BasicModal () {
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
    <Button key='cancel' size='large' onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key='apply' size='large' type='primary' onClick={handleConfirm}>
      Apply
    </Button>
  ]

  return (
    <>
      <Button onClick={showModal}>
        Basic Modal
      </Button>
      <Modal
        title='Basic Modal'
        visible={visible}
        footer={footer}
      >
        {content}
      </Modal>
    </>
  )  
}
