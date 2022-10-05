import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { NetworksTable } from '.'

jest.mock('socket.io-client')

const list = {
  totalCount: 10,
  page: 1,
  data: [
    {
      aps: 1,
      clients: 0,
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      name: 'network-01',
      nwSubType: 'psk',
      ssid: '01',
      venues: { count: 3, names: ['pingtung', 'My-Venue', '101'] },
      count: 3,
      names: ['pingtung', 'My-Venue', '101'],
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'ClickThrough',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8798',
      name: 'network-02',
      nwSubType: 'guest',
      ssid: '02',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 1,
      clients: 0,
      id: '373377b0cb6e46ea8982b1c80aabe1fa',
      name: 'network-03',
      nwSubType: 'aaa',
      ssid: '03',
      venues: { count: 2, names: ['101', 'My-Venue'] },
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'GuestPass',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8898',
      name: 'network-04',
      nwSubType: 'guest',
      ssid: '04',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 1,
      clients: 0,
      id: '373377b0cb6e46ea8982b1c80aabe2fa',
      name: 'network-05',
      nwSubType: 'dpsk',
      ssid: '05',
      venues: { count: 1, names: ['My-Venue'] },
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'SelfSignIn',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8998',
      name: 'network-06',
      nwSubType: 'guest',
      ssid: '06',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 0,
      captiveType: 'HostApproval',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd9098',
      name: 'network-07',
      nwSubType: 'guest',
      ssid: '07',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 0,
      captiveType: 'WISPr',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd9198',
      name: 'network-08',
      nwSubType: 'guest',
      ssid: '08',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 0,
      clients: 0,
      description: '',
      id: '3c62b3818d194022b8dd35852c66f646',
      name: 'network-09',
      nwSubType: 'open',
      ssid: '09',
      venues: { count: 0, names: [] },
      vlan: 2,
      vlanPool: {}
    },
    {
      aps: 0,
      captiveType: '',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd9398',
      name: 'network-10',
      nwSubType: 'guest',
      ssid: '10',
      venues: { count: 0, names: [] },
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: ''
        }
      },
      vlanPool: {
        name: 'test'
      }
    }
  ]
}

describe('Networks Table', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetwork.url,
        (req, res, ctx) => res(ctx.json({ requestId: '' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworksTable />
      </Provider>, {
        route: { params, path: '/:tenantId/networks' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

    await screen.findByText('Add Wi-Fi Network')
    await screen.findByText('network-01')
  })

  it('should click disabled row', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworksTable />
      </Provider>, {
        route: { params, path: '/:tenantId/networks' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

    const row = await screen.findByRole('row', { name: /network-02/i })
    fireEvent.click(row)

    await screen.findByText('Add Wi-Fi Network')
    await screen.findByText('network-02')
  })

  it('should delete selected row', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworksTable />
      </Provider>, {
        route: { params, path: '/:tenantId/networks' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

    const row = await screen.findByRole('row', { name: /network-01/i })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "network-01"?')
    const deleteNetworkButton = await screen.findByText('Delete Network')
    fireEvent.click(deleteNetworkButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
  }, 15000)
})
