import { useState } from 'react'

import { Drawer } from '..'
import { Button } from '../../Button'

export function DrawerWithBackButton () {
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
      <Button onClick={onOpen}>Drawer With BackButton</Button>
      <Drawer
        title={'With BackButton'}
        OnBackClick={onClose}
        visible={visible}
        onClose={onClose}
        children={content}
      />
    </>
  )
}
