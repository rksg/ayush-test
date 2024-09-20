
import React from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

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

describe('ScheduleTipsModal', () => {
  it('should render correct', async () => {
    render(<BasicTipsModal />)
    userEvent.click(await screen.findByText('Open'))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You can set custom schedule using the following options')).toBeVisible()
    userEvent.click(await screen.findByText('Open'))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You can set custom schedule using the following options')).not.toBeVisible()
  })
})