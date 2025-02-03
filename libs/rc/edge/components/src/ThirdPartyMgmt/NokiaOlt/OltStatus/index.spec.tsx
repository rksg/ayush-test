import React from 'react'

import { screen, render } from '@acx-ui/test-utils'

import { EdgeNokiaOltStatus } from './'

describe('EdgeNokiaOltStatus', () => {
  const config = {
    online: { color: 'green', text: 'Online' },
    offline: { color: 'red', text: 'Offline' }
  }

  const validProps = {
    config,
    status: 'online',
    showText: true
  }

  it('renders with valid config and status', () => {
    render(<EdgeNokiaOltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders with showText true and false', () => {
    const { rerender } = render(<EdgeNokiaOltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()

    rerender(<EdgeNokiaOltStatus {...validProps} showText={false} />)
    expect(screen.queryByText('Online')).toBeNull()
  })
})