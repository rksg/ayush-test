import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigProvider }                     from 'antd'
import { rest }                               from 'msw'
import { setupServer }                        from 'msw/node'
import { IntlProvider }                       from 'react-intl'

import { VenueExtended } from '@acx-ui/rc/utils'

import { VenueDrawer } from './VenueDrawer'

// Mock the VenuesForm component
jest.mock('@acx-ui/main/components', () => {
  const mockVenuesForm = ({ modalCallBack }: {
    modalCallBack?: (venue?: VenueExtended) => void
  }) => (
    <div data-testid='venues-form'>
      <button onClick={() => modalCallBack?.()}>Cancel</button>
      <button onClick={() => modalCallBack?.({
        id: '1',
        name: 'Test Venue'
      } as VenueExtended)}>Submit</button>
    </div>
  )

  return {
    VenuesForm: mockVenuesForm
  }
})

const server = setupServer(
  rest.get('/venues', (req, res, ctx) => {
    return res(ctx.json({ data: [] }))
  }),
  rest.get('http://localhost/globalValues.json', (req, res, ctx) => {
    return res(ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Test wrapper with all necessary providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <IntlProvider
      locale='en'
      messages={{
        'Ai+g6T': 'Add Venue'
      }}
    >
      {children}
    </IntlProvider>
  </ConfigProvider>
)

describe('VenueDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSuccess: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when open', async () => {
    render(
      <TestWrapper>
        <VenueDrawer {...defaultProps} />
      </TestWrapper>
    )

    // Check for drawer title - use the actual text that will be rendered
    await waitFor(() => {
      expect(screen.getByText('Add Venue')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <VenueDrawer {...defaultProps} open={false} />
      </TestWrapper>
    )

    expect(screen.queryByText('Add Venue')).not.toBeInTheDocument()
  })

  it('calls onClose when drawer is closed', async () => {
    render(
      <TestWrapper>
        <VenueDrawer {...defaultProps} />
      </TestWrapper>
    )

    // Wait for drawer to render
    await waitFor(() => {
      expect(screen.getByText('Add Venue')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find close button by aria-label
    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('renders venues form when open', async () => {
    render(
      <TestWrapper>
        <VenueDrawer {...defaultProps} />
      </TestWrapper>
    )

    // Wait for drawer to render
    await waitFor(() => {
      expect(screen.getByText('Add Venue')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Check for venues form
    await waitFor(() => {
      expect(screen.getByTestId('venues-form')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('handles venue form submission', async () => {
    render(
      <TestWrapper>
        <VenueDrawer {...defaultProps} />
      </TestWrapper>
    )

    // Wait for drawer to render
    await waitFor(() => {
      expect(screen.getByText('Add Venue')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Wait for venues form to render
    await waitFor(() => {
      expect(screen.getByTestId('venues-form')).toBeInTheDocument()
    }, { timeout: 3000 })

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
    render(
      <TestWrapper>
        <VenueDrawer {...defaultProps} />
      </TestWrapper>
    )

    // Wait for drawer to render
    await waitFor(() => {
      expect(screen.getByText('Add Venue')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Wait for venues form to render
    await waitFor(() => {
      expect(screen.getByTestId('venues-form')).toBeInTheDocument()
    }, { timeout: 3000 })

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })
})