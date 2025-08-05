/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen, renderHook, waitFor } from '@acx-ui/test-utils'

import { DeadPeerDetectionDelayFormItem } from './DeadPeerDetectionDelayFormItem'

// Mock antd components
jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    delete otherProps.dropdownClassName
    return (<select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>)
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('DeadPeerDetectionDelayFormItem', () => {
  const user = userEvent.setup()

  const renderComponent = () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    return render(<Form form={formRef.current}>
      <DeadPeerDetectionDelayFormItem />
      <button type='submit'>Submit</button>
    </Form>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render DeadPeerDetectionDelayFormItem with checkbox', () => {
      renderComponent()

      expect(screen.getByText('Dead Peer Detection Delay')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('should render tooltip with question icon', () => {
      renderComponent()

      const tooltip = screen.getByTestId('QuestionMarkCircleOutlined')
      expect(tooltip).toBeInTheDocument()
    })

    it('should not render delay input initially when checkbox is unchecked', () => {
      renderComponent()

      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
      expect(screen.queryByText('second(s)')).not.toBeInTheDocument()
    })
  })

  describe('Checkbox Functionality', () => {
    it('should allow checking the checkbox', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })

    it('should allow unchecking the checkbox', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('should render delay input when checkbox is checked', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      expect(checkbox).toBeChecked()

      expect(await screen.findByRole('spinbutton')).toBeInTheDocument()
      expect(screen.getByText('second(s)')).toBeInTheDocument()
    })

    it('should hide delay input when checkbox is unchecked', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()

      await user.click(checkbox)
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
      expect(screen.queryByText('second(s)')).not.toBeInTheDocument()
    })
  })

  describe('Delay Input Functionality', () => {
    it('should render InputNumber with correct attributes', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      expect(input).toBeInTheDocument()
    })

    it('should allow typing in the delay input', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.type(input, '30')

      expect(input).toHaveValue('30')
    })

    it('should maintain focus on input after typing', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.click(input)
      await user.type(input, '45')

      expect(input).toHaveFocus()
    })
  })

  describe('Form Validation', () => {
    it('should require delay value when checkbox is checked', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      // Trigger form validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(await screen.findByText('Please enter delay value')).toBeInTheDocument()
    })

    it('should validate minimum value (1)', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.type(input, '0')

      // Trigger validation
      await user.click(screen.getByRole('button', { name: /submit/i }))
      expect(await screen.findByText('Delay value must be integer and between 1-65536')).toBeInTheDocument()
    })

    it('should validate maximum value (65536)', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.type(input, '70000')

      // Trigger validation
      await user.click(screen.getByRole('button', { name: /submit/i }))
      expect(await screen.findByText('Delay value must be integer and between 1-65536')).toBeInTheDocument()
    })

    it('should accept valid delay values', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.type(input, '30')

      // Trigger validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Should not show validation error for valid value
      expect(screen.queryByText('Please enter delay value')).not.toBeInTheDocument()
      expect(screen.queryByText('Delay value must be integer and between 1-65536')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string input', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.clear(input)
      // Trigger validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('Please enter delay value')).toBeInTheDocument()
      })
    })

    it('should handle decimal values', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.type(input, '30.5')

      // InputNumber should handle decimal values appropriately
      expect(input).toHaveValue('30.5')

      await user.click(screen.getByRole('button', { name: /submit/i }))
      // eslint-disable-next-line max-len
      expect(await screen.findByText('Delay value must be integer and between 1-65536')).toBeInTheDocument()
    })

    it('should handle negative values', async () => {
      renderComponent()

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const input = screen.getByRole('spinbutton')
      await user.type(input, '-10')

      // Trigger validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('Delay value must be integer and between 1-65536')).toBeInTheDocument()
      })
    })
  })
})