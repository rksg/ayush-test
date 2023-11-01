import { render, fireEvent, screen } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { DropdownFooter } from './dropdownFooter'

describe('DropdownFooter', () => {
  it('renders correctly with Cancel and Apply buttons', () => {
    render(<IntlProvider locale='en'>
      <DropdownFooter onCancel={() => {}} onApply={() => {}} />
    </IntlProvider>)

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('calls onCancel callback when the Cancel button is clicked', () => {
    const mockOnCancel = jest.fn()
    render(<IntlProvider locale='en'>
      <DropdownFooter onCancel={mockOnCancel} onApply={() => {}} />
    </IntlProvider>)
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onApply callback when the Apply button is clicked', () => {
    const mockOnApply = jest.fn()
    render(<IntlProvider locale='en'>
      <DropdownFooter onCancel={() => {}} onApply={mockOnApply} />
    </IntlProvider>)
    fireEvent.click(screen.getByText('Apply'))
    expect(mockOnApply).toHaveBeenCalledTimes(1)
  })
})