/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { NetworkVenuesTab } from './index'

const network = {
  type: 'aaa',
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: 'Both',
      isAllApGroups: true,
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  name: '03',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

const user = { COMMON: '{"supportTriRadio":true,"tab-venue-clients":"wifi"}' }

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'd7b1a9a350634115a92ee7b0f11c7e75',
      name: 'network-venue-1',
      description: '',
      city: 'Melbourne, Victoria',
      country: 'Australia',
      latitude: '-37.8145092',
      longitude: '144.9704868',
      networks: { count: 1, names: ['03'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 },
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      allApDisabled: false
    },
    {
      id: '02e2ddbc88e1428987666d31edbc3d9a',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7691341',
      longitude: '-73.94297689999999',
      switchClients: 2,
      switches: 1,
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      wlan: { wlanSecurity: 'WPA3' }
    }
  ]
}
describe('NetworkVenuesTab', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    const { asFragment } = render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('network-venue-1')
    expect(asFragment()).toMatchSnapshot()
  })

  it('activate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const newVenues = [
      ...network.venues,
      {
        ...network.venues[0],
        venueId: '02e2ddbc88e1428987666d31edbc3d9a'
      }
    ]
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.post(
        CommonUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )

    const toogleButton = await screen.findByRole('switch', { checked: false })
    fireEvent.click(toogleButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))
  })

  it('deactivate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        CommonUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )

    const toogleButton = await screen.findByRole('switch', { checked: true })
    fireEvent.click(toogleButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  }, 20000)

  it('Table action bar activate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        CommonUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('My-Venue'))
    const activateButton = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateButton)

    mockServer.use(
      rest.put(
        CommonUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))
  })

  it('Table action bar activate Network and show modal', async () => {
    list.data[1].allApDisabled = true
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        CommonUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('My-Venue'))
    const activateButton = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateButton)
    await screen.findByRole('dialog')
    const OKButton = await screen.findByText('OK')
    await screen.findByText('Your Attention is Required')
    fireEvent.click(OKButton)

    mockServer.use(
      rest.put(
        CommonUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('Table action bar deactivate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        CommonUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('network-venue-1'))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateButton)

    mockServer.use(
      rest.put(
        CommonUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })
})
