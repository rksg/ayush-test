import userEvent from '@testing-library/user-event'

import { ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY } from '@acx-ui/rc/utils'
import { useParams }                               from '@acx-ui/react-router-dom'
import { Provider }                                from '@acx-ui/store'
import { render, screen }                          from '@acx-ui/test-utils'

import { CompatibleAlertBanner } from '.'

const venueId = 'mock_venue_id'
const tenantId = 'mock_tenant_id'
const spyOnSessionStorageSetItem = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: jest.fn().mockReturnValue({ tenantId })
}))

Object.defineProperty(window, 'sessionStorage', { value: {
  getItem: jest.fn().mockReturnValue(''),
  setItem: spyOnSessionStorageSetItem
} })

describe('CompatibleAlertBanner', () => {
  beforeEach(() => {
    spyOnSessionStorageSetItem.mockClear()
  })

  it('should render correctly', async () => {
    const mockOnClick = jest.fn()
    const mockOnClose = jest.fn()

    render(
      <Provider>
        <CompatibleAlertBanner
          title='Has incompatibile features'
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId' }
      })

    await screen.findByText('Has incompatibile features')
    await userEvent.click(screen.getByRole('button', { name: 'See details' }))
    expect(mockOnClick).toBeCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(mockOnClose).toBeCalledTimes(1)
    // eslint-disable-next-line max-len
    expect(spyOnSessionStorageSetItem).toBeCalledWith(ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY, tenantId)
  })

  it('should update session with custom key', async () => {
    render(
      <Provider>
        <CompatibleAlertBanner
          title='Incompatibile warning with custom key'
          cacheKey='test key'
          onClick={jest.fn()}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId' }
      })

    await screen.findByText('Incompatibile warning with custom key')
    await userEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(spyOnSessionStorageSetItem).toBeCalledWith('test key', tenantId)
  })

  it('should do nothing if no tenant id', async () => {
    jest.mocked(useParams).mockReturnValue({ tenantId: undefined })

    render(
      <Provider>
        <CompatibleAlertBanner
          title='Incompatibile warning with undefined tenantId'
          cacheKey='test key'
          onClick={jest.fn()}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId/venue/:venueId' }
      })

    await screen.findByText('Incompatibile warning with undefined tenantId')
    await userEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(window.sessionStorage.setItem).toBeCalledTimes(0)
  })
})