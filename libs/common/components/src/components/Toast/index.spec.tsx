import React from 'react'

import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { message }           from 'antd'

import { showToast } from '.'

describe('Toast', () => {
  let key: string | number
  afterEach(() => message.destroy(key))

  it('renders content', () => {
    key = showToast({
      type: 'info',
      content: 'This is a toast'
    })
    expect(screen.getByText('This is a toast')).toBeVisible()
  })

  it('renders extra content', () => {
    key = showToast({
      type: 'info',
      content: 'This is a toast',
      extraContent: <div data-testid='extra'>Extra content</div>
    })
    expect(screen.getByTestId('extra')).toBeVisible()
  })

  describe('link', () => {
    it('renders link', () => {
      key = showToast({
        type: 'info',
        content: 'This is a toast',
        link: { text: 'Click me', onClick: () => alert('clicked') }
      })
      const link = screen.getByRole('button')
      expect(link).toHaveTextContent('Click me')
      const alertMock = jest.spyOn(window, 'alert').mockImplementation()
      fireEvent.click(link)
      expect(alertMock).toHaveBeenCalledWith('clicked')
      jest.resetAllMocks()
    })

    it('renders default text for type', () => {
      key = showToast({
        type: 'error',
        content: 'This is a toast',
        link: { onClick: () => alert('clicked') }
      })
      const link = screen.getByRole('button')
      expect(link).toHaveTextContent('Technical Details')
    })
  })

  it('handles onClose', () => {
    key = showToast({
      type: 'error',
      content: 'This is a toast',
      onClose: () => alert('closed')
    })
    const alertMock = jest.spyOn(window, 'alert').mockImplementation()
    fireEvent.click(screen.getByRole('img'))
    expect(alertMock).toHaveBeenCalledWith('closed')
  })
})
