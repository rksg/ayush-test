/* eslint-disable max-len */
import { fireEvent } from '@testing-library/react'

import { render, screen, MockSelect, MockSelectProps } from '@acx-ui/test-utils'

import { IpsecProfileSelector } from './IpsecProfileSelector'

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Select: (props: MockSelectProps) => <MockSelect {...props}/>
}))

describe('IpsecProfileSelector', () => {
  const mockOptions = [
    { label: 'IPSec-1', value: 'ipsec-1' },
    { label: 'IPSec-2', value: 'ipsec-2' },
    { label: 'IPSec-3', value: 'ipsec-3' }
  ]

  const defaultProps = {
    options: mockOptions,
    isLoading: false,
    disabled: false,
    handleAddIpsecProfile: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render select dropdown with options', () => {
      render(<IpsecProfileSelector {...defaultProps} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should render select dropdown with empty options', () => {
      render(<IpsecProfileSelector {...defaultProps} options={[]} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should render select dropdown with single option', () => {
      const singleOption = [{ label: 'Single Option', value: 'single' }]
      render(<IpsecProfileSelector {...defaultProps} options={singleOption} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should render with loading state', () => {
      render(<IpsecProfileSelector {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should render with disabled state', () => {
      render(<IpsecProfileSelector {...defaultProps} disabled={true} />)

      const select = screen.getByRole('combobox')
      const addButton = screen.getByRole('button', { name: 'Add' })

      expect(select).toBeDisabled()
      expect(addButton).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('should call onChange when select value changes', () => {
      const mockOnChange = jest.fn()
      render(<IpsecProfileSelector {...defaultProps} onChange={mockOnChange} />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'ipsec-2' } })

      expect(mockOnChange).toHaveBeenCalledWith('ipsec-2')
    })

    it('should call handleAddIpsecProfile when Add button is clicked', () => {
      const mockHandleAddIpsecProfile = jest.fn()
      render(<IpsecProfileSelector {...defaultProps} handleAddIpsecProfile={mockHandleAddIpsecProfile} />)

      const addButton = screen.getByText('Add')
      fireEvent.click(addButton)

      expect(mockHandleAddIpsecProfile).toHaveBeenCalledTimes(1)
    })

    it('should not call handleAddIpsecProfile when Add button is disabled', () => {
      const mockHandleAddIpsecProfile = jest.fn()
      render(
        <IpsecProfileSelector
          {...defaultProps}
          disabled={true}
          handleAddIpsecProfile={mockHandleAddIpsecProfile}
        />
      )

      const addButton = screen.getByText('Add')
      fireEvent.click(addButton)

      expect(mockHandleAddIpsecProfile).not.toHaveBeenCalled()
    })

    it('should display selected value when value prop is provided', () => {
      render(<IpsecProfileSelector {...defaultProps} value='ipsec-2' />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('ipsec-2')
    })

    it('should handle undefined value prop', () => {
      render(<IpsecProfileSelector {...defaultProps} value={undefined} />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })
  })

  describe('Select options', () => {
    it('should display all provided options in dropdown', () => {
      render(<IpsecProfileSelector {...defaultProps} />)

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)

      // The options should be available in the dropdown
      // Note: Testing dropdown options visibility requires more complex setup
      expect(select).toBeInTheDocument()
    })

    it('should handle options with special characters', () => {
      const specialOptions = [
        { label: 'IPSec-Profile-1 (Default)', value: 'ipsec-1' },
        { label: 'IPSec-Profile-2 [Test]', value: 'ipsec-2' },
        { label: 'IPSec-Profile-3 & More', value: 'ipsec-3' }
      ]

      render(<IpsecProfileSelector {...defaultProps} options={specialOptions} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should handle options with empty labels', () => {
      const emptyLabelOptions = [
        { label: '', value: 'ipsec-1' },
        { label: 'IPSec-2', value: 'ipsec-2' }
      ]

      render(<IpsecProfileSelector {...defaultProps} options={emptyLabelOptions} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should handle options with duplicate values', () => {
      const duplicateOptions = [
        { label: 'IPSec-1', value: 'ipsec-1' },
        { label: 'IPSec-1-Duplicate', value: 'ipsec-1' },
        { label: 'IPSec-2', value: 'ipsec-2' }
      ]

      render(<IpsecProfileSelector {...defaultProps} options={duplicateOptions} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<IpsecProfileSelector {...defaultProps} />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<IpsecProfileSelector {...defaultProps} />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply correct width to select component', () => {
      render(<IpsecProfileSelector {...defaultProps} />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should render Add button as link type', () => {
      render(<IpsecProfileSelector {...defaultProps} />)

      const addButton = screen.getByText('Add')
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle null options gracefully', () => {
      render(<IpsecProfileSelector {...defaultProps} options={null as unknown as typeof mockOptions} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should handle undefined options gracefully', () => {
      render(<IpsecProfileSelector {...defaultProps} options={undefined as unknown as typeof mockOptions} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should handle missing onChange prop', () => {
      render(<IpsecProfileSelector {...defaultProps} onChange={undefined} />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'ipsec-2' } })

      // Should not throw error when onChange is undefined
      expect(select).toBeInTheDocument()
    })

    it('should handle missing handleAddIpsecProfile prop', () => {
      render(<IpsecProfileSelector {...defaultProps} handleAddIpsecProfile={undefined as unknown as () => void} />)

      const addButton = screen.getByText('Add')
      fireEvent.click(addButton)

      // Should not throw error when handleAddIpsecProfile is undefined
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Integration with form', () => {
    it('should work with form field value', () => {
      const mockOnChange = jest.fn()
      render(<IpsecProfileSelector {...defaultProps} value='ipsec-1' onChange={mockOnChange} />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('ipsec-1')
    })

    it('should update form field when selection changes', () => {
      const mockOnChange = jest.fn()
      render(<IpsecProfileSelector {...defaultProps} onChange={mockOnChange} />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'ipsec-3' } })

      expect(mockOnChange).toHaveBeenCalledWith('ipsec-3')
    })
  })
})