import { useState } from 'react'

import { Drawer }               from '..'
import { Button }               from '../../Button'
import { DrawerTypes, History } from '../styledComponents'

export function LeftDrawer () {
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
  }
  const data = [
    {
      duration: 'Yesterday',
      history: [
        {
          title: 'Alerts and notifications'
        },
        {
          title: 'Device inventory & Status'
        }
      ]
    },
    {
      duration: 'Previous 7 days',
      history: [
        {
          title: 'Client related'
        },
        {
          title: 'Map'
        }
      ]
    },
    {
      duration: 'December 20, 2024',
      history: [
        {
          title: 'Network topology'
        }
      ]
    }
  ]
  const content = <History>
    {
      data.map(i => <div className='duration'>
        <div className='title'>{i.duration}</div>
        {
          i.history.map(j => <div className='chat'>{j.title}</div>)
        }
      </div>)
    }
  </History>

  return (
    <>
      <Button onClick={onOpen}>Left Drawer</Button>
      <Drawer
        drawerType={DrawerTypes.Left}
        visible={visible}
        onClose={onClose}
        children={content}
        placement={'left'}
      />
    </>
  )
}
