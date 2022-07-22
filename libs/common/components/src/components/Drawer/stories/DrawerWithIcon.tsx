import { useState } from 'react'

import { BulbOutlined } from '@acx-ui/icons'

import { Drawer } from '..'
import { Button } from '../../Button'


export function DrawerWithIcon () {
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
      <Button onClick={onOpen}>Drawer With Icon</Button>
      <Drawer
        title={'With Icon'}
        icon={<BulbOutlined />}
        visible={visible}
        onClose={onClose}
        children={content}
      />
    </>
  )
}
