import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { InputInlineEditor } from './InputInlineEditor'

describe('InputInlineEditor', () => {
  const props = {
    value: 'test',
    index: 0,
    onChange: jest.fn(),
    onDelete: jest.fn()
  }

  it('should render correctly', () => {
    render(<InputInlineEditor {...props} />)
    expect(screen.getByText(props.value)).toBeInTheDocument()
    expect(screen.getByTestId('EditOutlined')).toBeInTheDocument()
    expect(screen.getByTestId('DeleteOutlined')).toBeInTheDocument()
  })

  it('should call onChange when apply button is clicked', async () => {
    render(<InputInlineEditor {...props} />)
    await userEvent.click(screen.getByTestId('EditOutlined'))
    await userEvent.type(screen.getByRole('textbox'), 'new value')
    await userEvent.click(screen.getByTestId('Check'))
    expect(props.onChange).toHaveBeenCalledWith('testnew value')
    expect(props.onChange).toBeCalledTimes(1)
  })

  it('should call onDelete when delete button is clicked', async () => {
    render(<InputInlineEditor {...props} />)
    await userEvent.click(screen.getByTestId('DeleteOutlined'))
    expect(props.onDelete).toHaveBeenCalledWith(props.index)
  })

  it('should call onDelete when cancel button is clicked and value is undefined', async () => {
    render(<InputInlineEditor {...props} value={undefined} />)
    await userEvent.click(screen.getByTestId('CloseSymbol'))
    expect(props.onDelete).toHaveBeenCalledWith(props.index)
  })
})