import { rest } from 'msw'

import { clientApi }                                          from '@acx-ui/rc/services'
import { ClientUrlsInfo, CommonRbacUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                    from '@acx-ui/store'
import { mockServer, render, screen }                         from '@acx-ui/test-utils'

import { ApWiredClientTable } from './ApWiredClientTable'

const ApWiredClientData = [{
  apId: 'ap_serial_01',
  apName: 'ap_01',
  apMac: 'aa:11:11:11:11:11',
  portNumber: 2,
  macAddress: '11:ff:11:11:11:11',
  deviceType: 'laptop',
  ipAddress: '192.168.0.10',
  hostname: 'wiredDevice1',
  venueId: 'venue_id_1',
  venueName: 'venue_01',
  vlanId: 10,
  authStatus: 'Authorized'
}]

describe('ApWiredClientTable', () => {
  const params = { tenantId: 'tenant-id' }
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    mockServer.use(
      rest.post(ClientUrlsInfo.getApWiredClients.url,
        (_, res, ctx) => res(ctx.json({ data: ApWiredClientData, page: 1, totalCount: 0 }))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json([{ id: 'venue_id_1', name: 'venue_01' }]))
      ),
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json([{ serialNumber: 'ap_serial_01', name: 'ap_01' }]))
      )
    )
  })

  it('Should render correctly', async () => {
    render(<Provider>
      <ApWiredClientTable />
    </Provider>, { route: { params } })

    expect(await screen.findByText('wiredDevice1')).toBeInTheDocument()
    expect(await screen.findByText('192.168.0.10')).toBeInTheDocument()
  })
})