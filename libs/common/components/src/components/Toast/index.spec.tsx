import React from 'react'

import '@testing-library/jest-dom'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { message }                    from 'antd'

import { showToast } from '.'

describe('Toast', () => {
  afterEach( async ()=>message.destroy())

  it('renders content', async () => {
    showToast({
      type: 'info',
      content: 'This is a toast'
    })
    await screen.findByText('This is a toast')
  })

  it('renders extra content', async () => {
    showToast({
      type: 'info',
      content: 'This is a toast - test extra',
      extraContent: <div data-testid='extra'>Extra content</div>
    })
    await screen.findByTestId('extra')
  })

  describe('link', () => {
    it('renders link', async () => {
      const onClick = jest.fn()
      showToast({
        type: 'info',
        content: 'This is a toast - test link',
        link: { text: 'Click me', onClick: onClick }
      })
      const link = await screen.findByText('Click me')
      fireEvent.click(link)
      expect(onClick).toBeCalledTimes(1)
    })

    it('renders default text for type', async () => {
      showToast({
        type: 'error',
        content: 'This is a toast - test click',
        link: { onClick: () => alert('clicked') }
      })
      await screen.findByText('Technical Details')
    })
  })

  it('handles onClose', async () => {
    const onClose = jest.fn()
    showToast({
      type: 'error',
      content: 'This is a toast - test close',
      onClose: onClose
    })
    const close = await waitFor(()=>screen.findByRole('img'))
    fireEvent.click(close)
    expect(onClose).toBeCalledTimes(1)
  })
})
