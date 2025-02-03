import React from 'react'

import { screen, render } from '@acx-ui/test-utils'

import { EdgeNokiaOltDetailsPageHeader } from '.'

describe('EdgeNokiaOltDetailsPageHeader', () => {
  const props: EdgeNokiaOltDetailsPageHeaderProps = {
    currentOlt: {
      name: 'Test OLT',
      status: 'online'
    }
  }

  it('renders component with valid props', () => {
    render(<EdgeNokiaOltDetailsPageHeader {...props} />)
    expect(screen.getByText('Test OLT')).toBeInTheDocument()
  })

  it('test onClickDetailsHandler function', () => {
    render(<EdgeNokiaOltDetailsPageHeader {...props} />)
    const button = screen.getByText('Device Details')
    fireEvent.click(button)
    expect(props.currentOlt.visible).toBe(true)
  })

  it('test visible state is updated correctly', () => {
    const { rerender } = render(<EdgeNokiaOltDetailsPageHeader {...props} />)
    const button = screen.getByText('Device Details')
    fireEvent.click(button)
    rerender(<EdgeNokiaOltDetailsPageHeader {...props} visible={true} />)
    expect(screen.getByText('Device Details')).toHaveAttribute('aria-expanded', 'true')
  })

  it('test component renders with expected elements', () => {
    render(<EdgeNokiaOltDetailsPageHeader {...props} />)
    expect(screen.getByText('Test OLT')).toBeInTheDocument()
    expect(screen.getByText('Device Details')).toBeInTheDocument()
    expect(screen.getAllByRole('grid')).toHaveLength(2)
    expect(screen.getAllByRole('card')).toHaveLength(1)
  })

  it('test component renders with expected text', () => {
    render(<EdgeNokiaOltDetailsPageHeader {...props} />)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Cages')).toBeInTheDocument()
    expect(screen.getByText('PoE Usage')).toBeInTheDocument()
  })
})