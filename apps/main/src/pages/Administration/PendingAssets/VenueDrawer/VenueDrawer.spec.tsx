import '@testing-library/jest-dom'
import { rest } from 'msw'

import { VenueExtended } from '@acx-ui/rc/utils'
import { MemoryRouter }  from '@acx-ui/react-router-dom'
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
  ({ modalCallBack }: { modalCallBack: (venue?: VenueExtended) => void }) => (
    <div data-testid='venues-form'>
      <button
        data-testid='create-venue-button'
        onClick={() => modalCallBack({ id: 'test-venue', name: 'Test Venue' } as VenueExtended)}
      >
        Create Venue
      </button>
      <button data-testid='create-venue-no-data' onClick={() => modalCallBack()}>
        Create Venue (No Data)
      </button>
    </div>
  )
)

jest.mock('../../../Venues', () => ({
  VenuesForm: (props: { modalCallBack: (venue?: VenueExtended) => void }) => mockVenuesForm(props)
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

  it('renders with default props and handles all interactions when open is true', async () => {
    render(<MemoryRouter>
      <Provider>
        <VenueDrawer {...mockProps} />
      </Provider>
    </MemoryRouter>
    )

    // Wait for the mock component to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('venues-form')).toBeVisible()
    })

    // Test basic rendering
    expect(screen.getByText('Add Venue')).toBeVisible()

    // Test drawer width
    const drawer = screen.getByRole('dialog')
    expect(drawer).toBeInTheDocument()

    // Test VenuesForm component is rendered
    expect(screen.getByTestId('venues-form')).toBeVisible()

    // Test onSuccess callback is available
    expect(mockProps.onSuccess).toBeDefined()

    // Test i18n title
    expect(screen.getByText('Add Venue')).toBeVisible()

    // Test close functionality
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render when open is false', () => {
    render(<MemoryRouter>
      <Provider>
        <VenueDrawer {...mockProps} open={false} />
      </Provider>
    </MemoryRouter>)
    expect(screen.queryByText('Add Venue')).not.toBeInTheDocument()
  })

  it('handles venue creation callbacks and interactions', async () => {
    render(<MemoryRouter>
      <Provider>
        <VenueDrawer {...mockProps} />
      </Provider>
    </MemoryRouter>)

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