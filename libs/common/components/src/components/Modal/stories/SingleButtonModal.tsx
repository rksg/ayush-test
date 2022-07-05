import { Button } from '../../Button'
import { Modal } from '..'
import { useState } from 'react'

export function SingleButtonModal () {
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

  const footer = [
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
        title="Single Button Modal"
        visible={visible}
        footer={footer}
        closable={false}
        width={800}
      >
        {content}
      </Modal>
    </>
   
  )  
}
