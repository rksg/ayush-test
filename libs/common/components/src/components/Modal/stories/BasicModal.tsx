import { Button } from '../../Button'
import { Modal } from '..'
import { useState } from 'react'

export function BasicModal () {
  const [visible, setVisible] = useState(false)
  const [mask, setMask] = useState(true)
  
  const content = <>
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </>

  const showModal = () => {
    setVisible(true)
    setMask(false)
  }

  const handleConfirm = () => {
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const footer = [
    <Button key="cancel" onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key="confirm" type="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  ]

  return (
    <>
      <Button onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title="Basic Modal"
        visible={visible}
        footer={footer}
        closable={false}
        mask={mask}
      >
        {content}
      </Modal>
    </>
   
  )  
}
