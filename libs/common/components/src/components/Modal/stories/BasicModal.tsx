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

  const handleOk = () => {
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  return (
    <>
      <Button onClick={showModal}>
        Basic Modal
      </Button>
      <Modal
        title='Basic Modal'
        visible={visible}
        okText='Apply'
        onCancel={handleCancel}
        onOk={handleOk}
        width={800}
      >
        {content}
      </Modal>
    </>
  )
}
