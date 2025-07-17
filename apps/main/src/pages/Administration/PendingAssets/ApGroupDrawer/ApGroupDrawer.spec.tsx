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

  describe('Rendering', () => {
    it('should render correctly when open', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      expect(screen.getByTestId('drawer')).toBeInTheDocument()
      expect(screen.getByText('Add AP Group')).toBeInTheDocument()
      expect(screen.getByTestId('ap-group-edit-context-provider')).toBeInTheDocument()
      expect(screen.getByTestId('ap-group-general-tab')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(<ApGroupDrawer {...defaultProps} open={false} />)

      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
    })

    it('should render with correct drawer props', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      const drawer = screen.getByTestId('drawer')
      expect(drawer).toHaveAttribute('role', 'dialog')
      expect(drawer).toHaveAttribute('aria-modal', 'true')
    })

    it('should render with correct title', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      expect(screen.getByText('Add AP Group')).toBeInTheDocument()
    })

    it('should render ApGroupGeneralTab with onFinish prop', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      expect(screen.getByTestId('ap-group-general-tab')).toBeInTheDocument()
      expect(screen.getByTestId('on-finish-button')).toBeInTheDocument()
    })
  })

  describe('Drawer close functionality', () => {
    it('should call onClose when drawer close button is clicked', () => {
      const mockOnClose = jest.fn()
      render(<ApGroupDrawer {...defaultProps} onClose={mockOnClose} />)

      const closeButton = screen.getByTestId('drawer-close-button')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when onFinish button is clicked', () => {
      const mockOnClose = jest.fn()
      render(<ApGroupDrawer {...defaultProps} onClose={mockOnClose} />)

      const onFinishButton = screen.getByTestId('on-finish-button')
      fireEvent.click(onFinishButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Props handling', () => {
    it('should pass correct props to Drawer component', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      // Check that the drawer is rendered with the expected structure
      expect(screen.getByTestId('drawer')).toBeInTheDocument()
      expect(screen.getByTestId('drawer-header')).toBeInTheDocument()
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()

      // Check that footer is null (as specified in the component)
      expect(screen.queryByTestId('drawer-footer')).not.toBeInTheDocument()
    })

    it('should handle multiple onClose calls correctly', () => {
      const mockOnClose = jest.fn()
      render(<ApGroupDrawer {...defaultProps} onClose={mockOnClose} />)

      // Click drawer close button
      const drawerCloseButton = screen.getByTestId('drawer-close-button')
      fireEvent.click(drawerCloseButton)

      // Click onFinish button
      const onFinishButton = screen.getByTestId('on-finish-button')
      fireEvent.click(onFinishButton)

      expect(mockOnClose).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration with ApGroupGeneralTab', () => {
    it('should render ApGroupGeneralTab within the drawer', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      const drawer = screen.getByTestId('drawer')
      const apGroupTab = screen.getByTestId('ap-group-general-tab')

      expect(drawer).toContainElement(apGroupTab)
    })

    it('should render ApGroupEditContextProvider', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      expect(screen.getByTestId('ap-group-edit-context-provider')).toBeInTheDocument()
    })

    it('should pass onFinish to ApGroupGeneralTab', () => {
      const mockOnClose = jest.fn()
      render(<ApGroupDrawer {...defaultProps} onClose={mockOnClose} />)

      // The onFinish button in the mocked ApGroupGeneralTab should call the onClose function
      const onFinishButton = screen.getByTestId('on-finish-button')
      fireEvent.click(onFinishButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      const drawer = screen.getByTestId('drawer')
      expect(drawer).toHaveAttribute('role', 'dialog')
      expect(drawer).toHaveAttribute('aria-modal', 'true')
    })

    it('should have accessible close button', () => {
      render(<ApGroupDrawer {...defaultProps} />)

      const closeButton = screen.getByTestId('drawer-close-button')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton.tagName).toBe('BUTTON')
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined onClose gracefully', () => {
      // This should not throw an error
      expect(() => {
        render(<ApGroupDrawer open={true} onClose={undefined as unknown as () => void} />)
      }).not.toThrow()
    })

    it('should handle null onClose gracefully', () => {
      // This should not throw an error
      expect(() => {
        render(<ApGroupDrawer open={true} onClose={null as unknown as () => void} />)
      }).not.toThrow()
    })

    it('should render correctly with minimal props', () => {
      render(<ApGroupDrawer open={true} onClose={() => {}} />)

      expect(screen.getByTestId('drawer')).toBeInTheDocument()
      expect(screen.getByTestId('ap-group-general-tab')).toBeInTheDocument()
    })
  })
})