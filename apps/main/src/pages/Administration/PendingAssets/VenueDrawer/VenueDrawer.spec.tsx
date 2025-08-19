import '@testing-library/jest-dom'
import { rest } from 'msw'

import { VenueExtended } from '@acx-ui/rc/utils'
import { Provider }      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'

import { VenueDrawer } from './VenueDrawer'

// Mock VenuesForm component
const mockVenuesForm = jest.fn(
  ({ modalCallBack }: {
    modalCallBack?: (venue?: VenueExtended) => void
    modalMode?: boolean
    specifiedAction?: 'override'
    dataFromParent?: VenueExtended | undefined
  }) => {
    // Ensure we're not calling any real hooks
    return (
      <div data-testid='venues-form'>
        <button
          data-testid='create-venue-button'
          onClick={() => modalCallBack?.({ id: 'test-venue', name: 'Test Venue' } as VenueExtended)}
        >
          Create Venue
        </button>
        <button data-testid='create-venue-no-data' onClick={() => modalCallBack?.()}>
          Create Venue (No Data)
        </button>
      </div>
    )
  }
)

// Mock the entire Venues module to avoid any real component rendering
jest.mock('../../../Venues', () => ({
  VenuesForm: jest.fn((props: {
    modalCallBack?: (venue?: VenueExtended) => void
    modalMode?: boolean
    specifiedAction?: 'override'
    dataFromParent?: VenueExtended | undefined
  }) => mockVenuesForm(props))
}))

const mockProps = {
  open: true,
  onClose: jest.fn(),
  onSuccess: jest.fn()
}

describe('VenueDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockVenuesForm.mockClear()

    // Mock unhandled requests
    mockServer.use(
      rest.get('*/tenants/preferences', (req, res, ctx) => {
        return res(ctx.json({
          tenantId: 'test-tenant',
          preferences: {}
        }))
      })
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when open is false', () => {
    render(
      <Provider>
        <VenueDrawer {...mockProps} open={false} />
      </Provider>
    )
    expect(screen.queryByText('Add Venue')).not.toBeInTheDocument()
  })

  it('handles venue creation callbacks and interactions', async () => {
    render(
      <Provider>
        <VenueDrawer {...mockProps} />
      </Provider>
    )

    // Wait for the mock component to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('venues-form')).toBeVisible()
    })

    // Test that both callbacks are available and properly configured
    expect(screen.getByText('Add Venue')).toBeVisible()
    expect(mockProps.onSuccess).toBeDefined()
    expect(mockProps.onClose).toBeDefined()

    // Test venue creation with venue data
    fireEvent.click(screen.getByTestId('create-venue-button'))
    expect(mockProps.onSuccess).toHaveBeenCalledWith({ id: 'test-venue', name: 'Test Venue' })
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)

    // Reset mocks for next test
    jest.clearAllMocks()

    // Test venue creation without venue data
    fireEvent.click(screen.getByTestId('create-venue-no-data'))
    expect(mockProps.onSuccess).toHaveBeenCalledWith(undefined)
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })
})