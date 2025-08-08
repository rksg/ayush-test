import '@testing-library/jest-dom'
import { rest }         from 'msw'
import { MemoryRouter } from 'react-router-dom'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { VenueDrawer } from './VenueDrawer'

const mockProps = {
  open: true,
  onClose: jest.fn(),
  onSuccess: jest.fn()
}

describe('VenueDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()

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

  it('renders with default props', async () => {
    render(
      <MemoryRouter>
        <Provider>
          <VenueDrawer {...mockProps} />
        </Provider>
      </MemoryRouter>
    )
    expect(screen.getByText('Add Venue')).toBeVisible()
  })

  it('closes drawer when close button is clicked', async () => {
    render(
      <MemoryRouter>
        <Provider>
          <VenueDrawer {...mockProps} />
        </Provider>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })
})