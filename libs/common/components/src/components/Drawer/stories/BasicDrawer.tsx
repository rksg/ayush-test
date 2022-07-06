import { useState } from 'react'

import { Drawer } from '..'
import { Button } from '../../Button'

export function BasicDrawer () {
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
  }
  const content = <>
    <p>some content</p>
    <p>some content</p>
    <p>some content</p>
  </>
  
  return (
    <>
      <Button onClick={onOpen}>Basic Drawer</Button>
      <Drawer 
        title={'Basic Drawer'}
        visible={visible}
        onClose={onClose}
        content={content}
      >
      </Drawer>
    </>
  )
}
