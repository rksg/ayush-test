import React from 'react'

import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { ApGroupDrawer } from './ApGroupDrawer'

// Mock the ApGroupGeneralTab component
jest.mock('@acx-ui/rc/components', () => ({
  ApGroupGeneralTab: ({ onFinish }: { onFinish?: () => Promise<boolean | void> }) => (
    <div data-testid='ap-group-general-tab'>
      <h2>AP Group General Tab</h2>
      <button onClick={onFinish} data-testid='on-finish-button'>
        Submit via onFinish
      </button>
      <button data-testid='add-button'>Add</button>
      <button data-testid='cancel-button'>Cancel</button>
    </div>
  ),
  ApGroupEditContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='ap-group-edit-context-provider'>
      {children}
    </div>
  )
}))

// Mock the Drawer component
jest.mock('@acx-ui/components', () => ({
  Drawer: ({
    children,
    title,
    visible,
    onClose,
    footer
  }: {
    children: React.ReactNode
    title: string
    visible: boolean
    onClose: () => void
    footer: React.ReactNode
  }) => (
    visible ? (
      <div data-testid='drawer' role='dialog' aria-modal='true'>
        <div data-testid='drawer-header'>
          <h1>{title}</h1>
          <button onClick={onClose} data-testid='drawer-close-button'>
            Close Drawer
          </button>
        </div>
        <div data-testid='drawer-content'>
          {children}
        </div>
        {footer && <div data-testid='drawer-footer'>{footer}</div>}
      </div>
    ) : null
  )
}))

describe('ApGroupDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(<ApGroupDrawer {...defaultProps} {...props} />)
  }

  describe('Rendering', () => {
    it('renders correctly when open', () => {
      renderComponent()

      expect(screen.getByTestId('drawer')).toBeInTheDocument()
      expect(screen.getByText('Add AP Group')).toBeInTheDocument()
      expect(screen.getByTestId('ap-group-edit-context-provider')).toBeInTheDocument()
      expect(screen.getByTestId('ap-group-general-tab')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      renderComponent({ open: false })

      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
    })

    it('renders with correct drawer props', () => {
      renderComponent()

      const drawer = screen.getByTestId('drawer')
      expect(drawer).toHaveAttribute('role', 'dialog')
      expect(drawer).toHaveAttribute('aria-modal', 'true')
    })

    it('renders with correct title', () => {
      renderComponent()

      expect(screen.getByText('Add AP Group')).toBeInTheDocument()
    })

    it('renders ApGroupGeneralTab with onFinish prop', () => {
      renderComponent()

      expect(screen.getByTestId('ap-group-general-tab')).toBeInTheDocument()
      expect(screen.getByTestId('on-finish-button')).toBeInTheDocument()
    })
  })

  describe('Drawer close functionality', () => {
    it('calls onClose when drawer close button is clicked', () => {
      const mockOnClose = jest.fn()
      renderComponent({ onClose: mockOnClose })

      const closeButton = screen.getByTestId('drawer-close-button')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when onFinish button is clicked', () => {
      const mockOnClose = jest.fn()
      renderComponent({ onClose: mockOnClose })

      const onFinishButton = screen.getByTestId('on-finish-button')
      fireEvent.click(onFinishButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('handles multiple onClose calls correctly', () => {
      const mockOnClose = jest.fn()
      renderComponent({ onClose: mockOnClose })

      const drawerCloseButton = screen.getByTestId('drawer-close-button')
      fireEvent.click(drawerCloseButton)

      const onFinishButton = screen.getByTestId('on-finish-button')
      fireEvent.click(onFinishButton)

      expect(mockOnClose).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration with ApGroupGeneralTab', () => {
    it('renders ApGroupGeneralTab within the drawer', () => {
      renderComponent()

      const drawer = screen.getByTestId('drawer')
      const apGroupTab = screen.getByTestId('ap-group-general-tab')

      expect(drawer).toContainElement(apGroupTab)
    })

    it('renders ApGroupEditContextProvider', () => {
      renderComponent()

      expect(screen.getByTestId('ap-group-edit-context-provider')).toBeInTheDocument()
    })

    it('passes onFinish to ApGroupGeneralTab', () => {
      const mockOnClose = jest.fn()
      renderComponent({ onClose: mockOnClose })

      const onFinishButton = screen.getByTestId('on-finish-button')
      fireEvent.click(onFinishButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderComponent()

      const drawer = screen.getByTestId('drawer')
      expect(drawer).toHaveAttribute('role', 'dialog')
      expect(drawer).toHaveAttribute('aria-modal', 'true')
    })

    it('has accessible close button', () => {
      renderComponent()

      const closeButton = screen.getByTestId('drawer-close-button')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton.tagName).toBe('BUTTON')
    })
  })

  describe('Edge cases', () => {
    it('handles undefined onClose gracefully', () => {
      expect(() => {
        renderComponent({ onClose: undefined as unknown as () => void })
      }).not.toThrow()
    })

    it('handles null onClose gracefully', () => {
      expect(() => {
        renderComponent({ onClose: null as unknown as () => void })
      }).not.toThrow()
    })

    it('renders correctly with minimal props', () => {
      renderComponent({ onClose: () => {} })

      expect(screen.getByTestId('drawer')).toBeInTheDocument()
      expect(screen.getByTestId('ap-group-general-tab')).toBeInTheDocument()
    })
  })
})