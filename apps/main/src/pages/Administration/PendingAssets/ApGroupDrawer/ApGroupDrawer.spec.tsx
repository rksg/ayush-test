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

import { ApGroupDrawer } from './ApGroupDrawer'

const mockProps = {
  open: true,
  onClose: jest.fn()
}

describe('ApGroupDrawer', () => {
  beforeAll(() => {
    // Set up apModelCapabilities mock with multiple patterns
    mockServer.use(
      rest.get('*/venues/apModelCapabilities', (_req, res, ctx) =>
        res(ctx.json({}))
      ),
      rest.get('*apModelCapabilities*', (_req, res, ctx) =>
        res(ctx.json({}))
      ),
      rest.get('http://localhost/venues/apModelCapabilities', (_req, res, ctx) =>
        res(ctx.json({}))
      ),
      rest.get('/venues/apModelCapabilities', (_req, res, ctx) =>
        res(ctx.json({}))
      )
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock unhandled requests
    mockServer.use(
      rest.post('*/venues/query', (req, res, ctx) => {
        return res(ctx.json({
          content: [],
          totalElements: 0
        }))
      }),
      rest.post('*/venues/aps/query', (req, res, ctx) => {
        return res(ctx.json({
          data: [],
          page: 0,
          totalCount: 0,
          extra: {}
        }))
      }),
      rest.post('*/apGroups/newApList', (req, res, ctx) => {
        return res(ctx.json({
          data: [],
          page: 0,
          totalCount: 0,
          extra: {}
        }))
      }),
      rest.post('*/venues/list', (req, res, ctx) => {
        return res(ctx.json({
          data: [],
          page: 0,
          totalCount: 0
        }))
      }),
      rest.post('*/apGroups/list', (req, res, ctx) => {
        return res(ctx.json({
          data: [],
          page: 0,
          totalCount: 0
        }))
      }),
      rest.post('*/switch/clients/list', (req, res, ctx) => {
        return res(ctx.json({
          data: [],
          page: 0,
          totalCount: 0
        }))
      }),
      rest.get('*/wifi/capabilities', (req, res, ctx) => {
        return res(ctx.json({
          poePorts: []
        }))
      }),
      rest.get('*/venues/aps/capabilities', (req, res, ctx) => {
        return res(ctx.json({
          capabilities: []
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
          <ApGroupDrawer {...mockProps} />
        </Provider>
      </MemoryRouter>
    )
    expect(screen.getByText('Add AP Group')).toBeVisible()
  })

  it('closes drawer when close button is clicked', async () => {
    render(
      <MemoryRouter>
        <Provider>
          <ApGroupDrawer {...mockProps} />
        </Provider>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })
})