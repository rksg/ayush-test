import React from 'react'

import { storiesOf } from '@storybook/react'

import { Button } from '../Button'

import { ScheduleTipsModal } from '.'

export const BasicTipsModal = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <>
      <Button type='primary' onClick={() => setIsOpen(true)}>Open</Button>
      <ScheduleTipsModal isModalOpen={isOpen} onOK={() => setIsOpen(false)}/>
    </>
  )
}

storiesOf('ScheduleTipsModal', module)
  .add('default', BasicTipsModal)

export {}
