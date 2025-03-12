import  userEvent from '@testing-library/user-event'

import { screen, render, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { TextInlineEditor } from './TextInlineEditor'

describe('TextInlineEditor', () => {
  const onChange = jest.fn().mockImplementation(() =>
    new Promise(resolve => setTimeout(resolve, 500)))

  const props = { value: 10, onChange }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('toggles edit mode', async () => {
    render(<TextInlineEditor {...props} />)
    const editButton = screen.getByRole('button', { name: 'edit' })
    await userEvent.click(editButton)
    expect(screen.getByRole('button', { name: 'check' })).toBeInTheDocument()
    const cancelButton = screen.getByRole('button', { name: 'close' })
    expect(cancelButton).toBeInTheDocument()
    await userEvent.click(editButton)
    await screen.findByRole('button', { name: 'edit' })
  })

  it('applies changes', async () => {
    render(<TextInlineEditor {...props} />)
    const editButton = screen.getByRole('button', { name: 'edit' })
    await userEvent.click(editButton)
    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '20')
    const applyButton = screen.getByRole('button', { name: 'check' })
    await userEvent.click(applyButton)
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(onChange).toHaveBeenCalledWith(1020)
  })

  it('cancels changes', async () => {
    render(<TextInlineEditor {...props} />)
    screen.getByText('10')
    const editButton = screen.getByRole('button', { name: 'edit' })
    await userEvent.click(editButton)
    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '30')
    const cancelButton = screen.getByRole('button', { name: 'close' })
    await userEvent.click(cancelButton)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should display props value when it changed', async () => {
    const { rerender } = render(<TextInlineEditor {...props} />)
    screen.getByText('10')
    const editButton = screen.getByRole('button', { name: 'edit' })
    await userEvent.click(editButton)
    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '30')
    const cancelButton = screen.getByRole('button', { name: 'close' })
    await userEvent.click(cancelButton)
    expect(screen.getByText('10')).toBeInTheDocument()

    rerender(<TextInlineEditor {...props} value={66} />)
    screen.getByText('66')
  })

  it('handles VLAN change', async () => {
    render(<TextInlineEditor {...props} value={2} />)
    const editButton = screen.getByRole('button', { name: 'edit' })
    await userEvent.click(editButton)
    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '22')
    expect(input).toHaveValue('222')
  })

  it('displays submitting state', async () => {
    render(<TextInlineEditor {...props} />)
    const editButton = screen.getByRole('button', { name: 'edit' })
    await userEvent.click(editButton)
    const applyButton = screen.getByRole('button', { name: 'check' })
    await userEvent.click(applyButton)
    const validatingIcon = screen.getByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validatingIcon)
  })

  it('should reset to initial value after change API failed', async () => {
    render(<TextInlineEditor {...props} onChange={() => Promise.reject()} />)
    const editButton = screen.getByRole('button', { name: 'edit' })
    await userEvent.click(editButton)
    const applyButton = screen.getByRole('button', { name: 'check' })
    await userEvent.click(applyButton)
    await screen.findByText('10')
  })
})