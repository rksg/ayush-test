import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IntlProvider }                       from 'react-intl'
import { MemoryRouter }                       from 'react-router-dom'

import { VenueExtended } from '@acx-ui/rc/utils'
import { Provider }      from '@acx-ui/store'

import { VenueDrawer } from './VenueDrawer'

// Mock the VenuesForm component
jest.mock('../../../Venues', () => ({
  VenuesForm: ({
    modalCallBack,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    modalMode,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    specifiedAction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dataFromParent
  }: {
    modalCallBack?: (venue?: VenueExtended) => void
    modalMode?: boolean
    specifiedAction?: 'override'
    dataFromParent?: VenueExtended | undefined
  }) => (
    <div data-testid='venues-form'>
      <button onClick={() => modalCallBack?.()}>Cancel</button>
      <button onClick={() => modalCallBack?.({
        id: '1',
        name: 'Test Venue'
      } as VenueExtended)}>Submit</button>
    </div>
  )
}))

// Mock the Drawer component
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Drawer: ({ children, title, visible, onClose }: {
    children: React.ReactNode
    title: string
    visible: boolean
    onClose: () => void
  }) => (
    visible ? (
      <div data-testid='drawer'>
        <div data-testid='drawer-title'>{title}</div>
        <button onClick={onClose} aria-label='Close'>Close</button>
        {children}
      </div>
    ) : null
  )
}))

describe('VenueDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSuccess: jest.fn()
  }

  const messages = {
    dYalm5: 'Add Venue',
    VenueSingular: 'Venue'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <IntlProvider locale='en' messages={messages}>
          <Provider>
            <VenueDrawer {...defaultProps} {...props} />
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    )
  }

  const waitForDrawer = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('drawer')).toBeInTheDocument()
    }, { timeout: 3000 })
  }

  const waitForVenuesForm = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('venues-form')).toBeInTheDocument()
    }, { timeout: 3000 })
  }

  describe('Rendering', () => {
    it('renders correctly when open', async () => {
      render(
        <MemoryRouter>
          <IntlProvider locale='en' messages={messages}>
            <Provider>
              <VenueDrawer {...defaultProps} />
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      )
      expect(screen.getByTestId('drawer')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <MemoryRouter>
          <IntlProvider locale='en' messages={messages}>
            <Provider>
              <VenueDrawer {...defaultProps} open={false} />
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      )

      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
    })

    it('renders venues form when open', async () => {
      renderComponent()

      await waitForDrawer()
      await waitForVenuesForm()
    })
  })

  describe('Form Interactions', () => {
    it('calls onClose when drawer is closed', async () => {
      renderComponent()

      await waitForDrawer()

      const closeButton = screen.getByLabelText('Close')
      fireEvent.click(closeButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('handles venue form submission', async () => {
      renderComponent()

      await waitForDrawer()
      await waitForVenuesForm()

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith({ id: '1', name: 'Test Venue' })
      })

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('handles venue form cancellation', async () => {
      renderComponent()

      await waitForDrawer()
      await waitForVenuesForm()

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })
  })
})