import { useState } from 'react'

import { Modal }  from '..'
import { Button } from '../../Button'

export function BasicModal () {
  const [visible, setVisible] = useState(false)

  const content = <>
    {Array(100).fill(null).map((_, index) => <p key={index}>Some contents...</p>)}
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

  const footer = [
    <Button key='back' onClick={handleCancel}>
      Return
    </Button>,
    <Button key='forward' onClick={handleCancel}>
      Forward
    </Button>,
    <Button key='save' type='primary' onClick={handleOk}>
      Save and Exit
    </Button>,
    <Button key='submit' type='primary' onClick={handleOk}>
      Submit
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
        onCancel={handleCancel}
        width={800}
        footer={footer}
      >
        {content}
      </Modal>
    </>
  )
}
