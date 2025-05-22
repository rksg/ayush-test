import { rest } from 'msw'

import { clientApi }                                          from '@acx-ui/rc/services'
import { ClientUrlsInfo, CommonRbacUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                    from '@acx-ui/store'
import { mockServer, render, screen }                         from '@acx-ui/test-utils'
import userEvent                                              from '@testing-library/user-event'

import { ApWiredClientTable } from '.'

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
},{
  apId: 'ap_serial_01',
  apName: 'ap_01',
  apMacAddress: 'aa:11:11:11:11:11',
  portNumber: 1,
  macAddress: '22:ff:11:11:11:11',
  deviceTypeStr: 'phone',
  ipAddress: '192.168.0.12',
  hostname: 'wiredDevice2',
  venueId: 'venue_id_1',
  venueName: 'venue_01',
  vlanId: 1,
  status: 0,
  osType: 'Linux'
},{
  macAddress: '33:ff:11:11:11:11',
  hostname: 'wiredDevice2',
  status: -1
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

    expect(await screen.findByText('Hostname')).toBeInTheDocument()
    expect(await screen.findByText('OS')).toBeInTheDocument()
    expect(await screen.findByText('MAC Address')).toBeInTheDocument()
    expect(await screen.findByText('IP Address')).toBeInTheDocument()
    expect(await screen.findAllByText('Venue')).toHaveLength(2)
    expect(await screen.findAllByText('AP')).toHaveLength(2)
    expect(await screen.findByText('AP MAC')).toBeInTheDocument()
    expect(await screen.findByText('LAN Port')).toBeInTheDocument()
    expect(await screen.findByText('VLAN')).toBeInTheDocument()
    expect(await screen.findByText('Auth Status')).toBeInTheDocument()
    expect(await screen.findByText('Device Type')).toBeInTheDocument()
  })

  it('Should render correctly with searchable config', async () => {
    render(<Provider>
      <ApWiredClientTable searchable={true}/>
    </Provider>, { route: { params } })

    expect(await screen.findByText('wiredDevice1')).toBeInTheDocument()
    expect(await screen.findByText('192.168.0.10')).toBeInTheDocument()
    expect(await screen.findAllByText('venue_01')).toHaveLength(2)
    expect(await screen.findByText('11:ff:11:11:11:11')).toBeInTheDocument()
    expect(await screen.findByText('22:ff:11:11:11:11')).toBeInTheDocument()
    expect(await screen.findByText('33:ff:11:11:11:11')).toBeInTheDocument()
    expect(await screen.findAllByText('aa:11:11:11:11:11')).toHaveLength(2)
    expect(await screen.findByRole('button', { name: 'LAN 1' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'LAN 2' })).toBeVisible()
  })

  it('Should render lan port profile detail drawer correctly', async () => {
    render(<Provider>
      <ApWiredClientTable searchable={true}/>
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: 'LAN 1' }))
    await userEvent.click(await screen.findByRole('button', { name: 'LAN 2' }))
  })
})