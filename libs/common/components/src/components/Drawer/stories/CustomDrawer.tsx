import { useState } from 'react'
import { Drawer }   from '..'
import { Button }   from '../../Button'

export function CustomDrawer () {
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

  const footer = <>
    <Button onClick={onClose}>Cancel</Button>
  </>
  
  return (
    <>
      <Button onClick={onOpen}>Custom Drawer</Button>
      <Drawer 
        title={'Custom Drawer'}
        visible={visible}
        onClose={onClose}
        content={content}
        footer={footer}
      />
    </>
  )
}
