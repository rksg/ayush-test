import { useState } from 'react'

import { Drawer }      from '..'
import { Button }      from '../../Button'
import { DrawerTypes } from '../styledComponents'

export function FullHeightDrawer () {
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
      <Button onClick={onOpen}>Full Height Drawer</Button>
      <Drawer
        drawerType={DrawerTypes.FullHeight}
        title={'Full Height Drawer'}
        visible={visible}
        onClose={onClose}
        children={content}
      />
    </>
  )
}
