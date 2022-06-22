/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { NetworkVenuesTab } from './index'

let network = {
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

let list = {
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

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()

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

    const { asFragment } = render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('network-venue-1')
    expect(asFragment()).toMatchSnapshot()
    const toogleButton = screen.getByRole('switch', { checked: false })
    fireEvent.click(toogleButton)
    mockServer.use(
      rest.post(
        CommonUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
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

    const { asFragment } = render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('network-venue-1')
    expect(asFragment()).toMatchSnapshot()
    const toogleButton = screen.getByRole('switch', { checked: true })
    fireEvent.click(toogleButton)
    mockServer.use(
      rest.delete(
        CommonUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
})
