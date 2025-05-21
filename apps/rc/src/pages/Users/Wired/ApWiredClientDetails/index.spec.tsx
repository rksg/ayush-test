import { rest } from 'msw'

import { apApi, clientApi }                               from '@acx-ui/rc/services'
import { ClientUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import ApWiredClientDetails from '.'


const ApWiredClientData = [{
  apId: 'ap_serial_01',
  apName: 'ap_01',
  apMacAddress: 'aa:11:11:11:11:11',
  portNumber: 2,
  macAddress: '11:ff:11:11:11:11',
  deviceTypeStr: 'laptop',
  ipAddress: '192.168.0.10',
  hostname: 'wiredDevice1',
  venueId: 'venue_id_1',
  venueName: 'venue_01',
  vlanId: 10,
  status: 1,
  osType: 'MacOS'
}]

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApWiredClientOverviewTab', () => () => {
  return <div data-testid='apWiredClientOverviewTab' />
})

jest.mock('./ApWiredClientEventTab', () => () => {
  return <div data-testid='apWiredClientEventTab' />
})

describe('AP Wired Client Details', () => {
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())

    mockServer.use(
      rest.post(ClientUrlsInfo.getApWiredClients.url,
        (_, res, ctx) => res(ctx.json({ data: ApWiredClientData, page: 1, totalCount: 0 }))
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    render(<Provider><ApWiredClientDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wired/wifi/clients/:clientId/details/:activeTab' }
    })
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })

    const overviewTab = screen.getByRole('tab', { name: 'Overview' })
    expect(overviewTab.getAttribute('aria-selected')).toBeTruthy()

    const eventTab = screen.getByRole('tab', { name: 'Event' })
    fireEvent.click(eventTab)
    expect(eventTab.getAttribute('aria-selected')).toBeTruthy()
  })
})