import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { clientApi, switchApi }           from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { ClientsTable }        from './ClientsTable'
import { SwitchClientDetails } from './SwitchClientDetails'

import { SwitchClientsTable } from './'

const clientList = {
  fields: [
    'clientDesc',
    'clientType',
    'switchId', 'switchName',
    'clientMac',
    'clientName',
    'venueId', 'venueName',
    'clientVlan',
    'switchSerialNumber',
    'vlanName',
    'cog',
    'id',
    'switchPort'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'NTg6ZmI6OTY6MGU6YzA6YzRfNTggZmIgOTYgMGUgYzAgY2FfMS0xLTdfMzQ6MjA6RTM6MkM6QjU6QjBfMQ==',
      clientMac: '34:20:E3:2C:B5:B0',
      clientDesc:
        'Ruckus R510 Multimedia Hotzone Wireless AP/SW Version: 114.0.0.0.1360',
      clientType: 'WLAN_AP',
      switchName: 'ICX7150-C12 Router',
      switchId: '58:fb:96:0e:c0:c4',
      switchPort: '1/1/7',
      venueName: 'My-Venue',
      venueId: 'a98653366d2240b9ae370e48fab3a9a1',
      clientVlan: '1',
      vlanName: 'DEFAULT-VLAN',
      clientName: 'RuckusAP',
      switchSerialNumber: 'FEK3230S0DA'
    }
  ]
}

const clientDetail = {
  clientAuthType: 'CLIENT_AUTH_TYPE_NONE',
  switchId: '58:fb:96:0e:c0:c4',
  clientMac: '34:20:E3:2C:B5:B0',
  clientName: 'RuckusAP',
  clientUserName: '',
  clientUpTime: '12123400',
  type: 'sclient',
  clientDesc:
    'Ruckus R510 Multimedia Hotzone Wireless AP/SW Version: 114.0.0.0.1360',
  clientType: 'WLAN_AP',
  switchName: 'ICX7150-C12 Router',
  switchMac: '58:fb:96:0e:c0:c4',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  unitId: 'FEK3230S0DA',
  clientIpv4Addr: '00 00 00 00',
  id: 'NTg6ZmI6OTY6MGU6YzA6YzRfNTggZmIgOTYgMGUgYzAgY2FfMS0xLTdfMzQ6MjA6RTM6MkM6QjU6QjBfMQ==',
  switchPort: '1/1/7',
  timestamp: 1673436143865,
  updatedTime: 1673436143865,
  vlanName: 'DEFAULT-VLAN',
  clientAuthStatus: 'NO_AUTH',
  venueName: 'My-Venue',
  ruckusAP: false,
  clientIpv6Addr: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
  tenantId: 'f2e4a77d49914dc7b1bcb0dfc21b9a74',
  clientVlan: '1',
  switchSerialNumber: 'FEK3230S0DA',
  switchPortId: '58 fb 96 0e c0 ca_1-1-7'
}

const apList = {
  fields: ['serialNumber', 'name', 'apMac'],
  totalCount: 0,
  page: 1,
  data: []
}

describe('SwitchClientsTable', () => {
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
    global.URL.createObjectURL = jest.fn()
    HTMLAnchorElement.prototype.click = jest.fn()
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientList.url, (_, res, ctx) =>
        res(ctx.json(clientList))
      ),
      rest.post(SwitchUrlsInfo.getSwitchList.url, (_, res, ctx) =>
        res(ctx.json({
          data: [{ id: '58:fb:96:0e:c0:c4', name: 'ICX7150-C12 Router' }]
        }))
      ),
      rest.post(CommonUrlsInfo.getApsList.url, (_, res, ctx) =>
        res(ctx.json(apList))
      ),
      rest.post(SwitchUrlsInfo.getSwitchClientDetail.url, (_, res, ctx) =>
        res(ctx.json(clientDetail))
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switch-id',
      serialNumber: 'serialNumber'
    }

    render(
      <Provider>
        <SwitchClientsTable />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/clients'
        }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )
    await screen.findByText('34:20:E3:2C:B5:B0')
  })

  it('should trigger search client correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switch-id',
      serialNumber: 'serialNumber'
    }

    render(
      <Provider>
        <SwitchClientsTable />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/clients'
        }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )

    await screen.findByText('34:20:E3:2C:B5:B0')

    const searchInput = await screen.findByRole('textbox')
    fireEvent.change(searchInput, { target: { value: '34:' } })

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )

    await screen.findByText('34:20:E3:2C:B5:B0')
  })

  it('should render switch client table correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switch-id',
      serialNumber: 'serialNumber'
    }

    render(
      <Provider>
        <ClientsTable searchable={true} />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/clients'
        }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )
    await screen.findByText('34:20:E3:2C:B5:B0')
  })

  it('should render switch client detail page correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switch-id',
      serialNumber: 'serialNumber',
      clientId: 'client-id'
    }

    render(
      <Provider>
        <SwitchClientDetails />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/switch/clients/:clientId'
        }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )
    await screen.findByRole('heading', { level: 1, name: 'RuckusAP' })

    const exportCSVButton = await screen.findByRole('button', { name: 'Download Information' })
    await userEvent.click(exportCSVButton)
  })

  it('should render blank fields correctly', async () => {
    const clientListWithEmpty = { ...clientList,
      data: [
        {
          // eslint-disable-next-line max-len
          id: 'NTg6ZmI6OTY6MGU6YzA6YzRfNTggZmIgOTYgMGUgYzAgY2FfMS0xLTdfMzQ6MjA6RTM6MkM6QjU6QjBfMQ==',
          clientDesc: '',
          clientType: '',
          switchId: '58:96:0e:c0:c4:fb', // non-exist switch
          switchPort: '1/1/7',
          venueId: 'a98653366d2240b9ae370e48fab3a9a1',
          clientName: '',
          switchSerialNumber: 'FEK3230S0DA'
        }
      ]
    }

    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientList.url, (_, res, ctx) =>
        res(ctx.json(clientListWithEmpty))
      )
    )

    const params = {
      tenantId: 'tenant-id'
    }

    render(
      <Provider>
        <SwitchClientsTable />
      </Provider>,
      {
        route: { params, path: '/:tenantId/users/switch/clients' }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )
  })

  it('should render router type correctly', async () => {
    const clientListWithRouter = { ...clientList,
      data: [
        {
          // eslint-disable-next-line max-len
          id: 'NTg6ZmI6OTY6MGU6YzA6YzRfNTggZmIgOTYgMGUgYzAgY2FfMS0xLTdfMzQ6MjA6RTM6MkM6QjU6QjBfMQ==',
          clientDesc: '',
          clientType: 'ROUTER',
          switchName: 'ICX7150-C12 Router',
          switchId: '58:fb:96:0e:c0:c4',
          switchPort: '1/1/7',
          venueName: 'My-Venue',
          venueId: 'a98653366d2240b9ae370e48fab3a9a1',
          clientName: '',
          switchSerialNumber: 'FEK3230S0DA'
        }
      ]
    }

    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientList.url, (_, res, ctx) =>
        res(ctx.json(clientListWithRouter))
      )
    )

    const params = {
      tenantId: 'tenant-id'
    }

    render(
      <Provider>
        <SwitchClientsTable />
      </Provider>,
      {
        route: { params, path: '/:tenantId/users/switch/clients' }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )

    expect(await screen.findByText('Router')).toBeVisible()
  })

  it('should render correctly when feature flag SWITCH_DHCP_CLIENTS is on', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switch-id',
      serialNumber: 'serialNumber'
    }

    const clientListWithEmpty = { ...clientList,
      data: [
        {
          ...clientList.data?.[0],
          clientIpv4Addr: '1.1.1.1',
          clientType: 'OTHER'
        }
      ]
    }

    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientList.url, (_, res, ctx) =>
        res(ctx.json(clientListWithEmpty))
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <SwitchClientsTable />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/clients'
        }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )
    await screen.findByText('34:20:E3:2C:B5:B0')
    await screen.findByText('1.1.1.1')

    expect(await screen.findByTestId('GenericOs')).toBeVisible()
    expect(await screen.findByTestId('GenericDeviceOutlined')).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should render switch client detail page correctly when feature flag SWITCH_DHCP_CLIENTS is on', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switch-id',
      serialNumber: 'serialNumber',
      clientId: 'client-id'
    }

    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientDetail.url, (_, res, ctx) =>
        res(ctx.json({
          ...clientDetail,
          dhcpClientOsVendorName: 'windows'
        }))
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <SwitchClientDetails />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/switch/clients/:clientId'
        }
      }
    )

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('img', { name: 'loader' })
    )
    await screen.findByRole('heading', { level: 1, name: 'RuckusAP' })
    expect(await screen.findByTestId('Microsoft')).toBeVisible()

    const exportCSVButton = await screen.findByRole('button', { name: 'Download Information' })
    await userEvent.click(exportCSVButton)
  })
})
