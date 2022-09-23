/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

import * as config         from '@acx-ui/config'
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
  wlan: {
    enabled: true,
    ssid: '03',
    vlanId: 1
  },
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

const timezoneRes = { // location=-37.8145092,144.9704868
  dstOffset: 0,
  rawOffset: 36000,
  status: 'OK',
  timeZoneId: 'Australia/Melbourne',
  timeZoneName: 'Australian Eastern Standard Time'
}

describe('NetworkVenuesTab', () => {
  beforeAll(async () => {
    const env = {
      GOOGLE_MAPS_KEY: 'FAKE_GOOGLE_MAPS_KEY'
    }
    mockServer.use(rest.get('/env.json', (_, r, c) => r(c.json(env))))
    await config.initialize()
  })

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

    const row1 = await screen.findByRole('row', { name: /network-venue-1/i })
    expect(asFragment()).toMatchSnapshot()
    expect(within(row1).queryAllByRole('button')).toHaveLength(4)
    expect(row1).toHaveTextContent('VLAN-1 (Default)')
    expect(row1).toHaveTextContent('All APs')
    expect(row1).toHaveTextContent('2.4 GHz, 5 GHz')
    expect(row1).toHaveTextContent('24/7')

    const row2 = await screen.findByRole('row', { name: /My-Venue/i })
    expect(within(row2).queryAllByRole('button')).toHaveLength(0)
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
        venueId: '02e2ddbc88e1428987666d31edbc3d9a',
        allApGroupsRadioTypes: ['2.4-GHz', '5-GHz', '6-GHz'],
        isAllApGroups: false,
        scheduler: {
          type: 'ALWAYS_ON'
        },
        apGroups: [{
          radio: 'Both',
          radioTypes: ['2.4-GHz'],
          isDefault: true,
          id: '6cb1e831973a4d60924ac59f1bda073c',
          apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
          apGroupName: 'APs not assigned to any group',
          vlanPoolId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          vlanPoolName: 'pool1'
        }]
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

    const row2 = await screen.findByRole('row', { name: /My-Venue/i })
    expect(row2).toHaveTextContent('VLAN Pool: pool1 (Custom)')
    expect(row2).toHaveTextContent('Unassigned APs')
    expect(row2).toHaveTextContent('24/7')
    expect(row2).not.toHaveTextContent('All')
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
  })

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
      ),
      rest.put(
        CommonUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('My-Venue'))
    const activateButton = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateButton)

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
      ),
      rest.put(
        CommonUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
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
      ),
      rest.put(
        CommonUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('network-venue-1'))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })

  it('has custom scheduling', async () => {

    const newVenues = [
      {
        ...network.venues[0],
        scheduler: {
          type: 'CUSTOM',
          sun: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          mon: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          thu: '000000000000000000000000000000000000000111111111111111111111111111111111111111111111111111111111',
          fri: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          sat: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        }
      },
      {
        ...network.venues[0],
        venueId: '02e2ddbc88e1428987666d31edbc3d9a',
        scheduler: {
          type: 'CUSTOM',
          sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          mon: '111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000',
          tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
        },
        isAllApGroups: false,
        apGroups: [{
          radio: 'Both',
          radioTypes: ['5-GHz','2.4-GHz'],
          isDefault: true,
          apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
          id: '6cb1e831973a4d60924ac59f1bda073c',
          apGroupName: 'APs not assigned to any group',
          vlanId: 1
        },{
          radio: 'Both',
          radioTypes: ['5-GHz','2.4-GHz'],
          isDefault: false,
          apGroupId: '8ef01f614f1644d3869815aae82036b3',
          id: '9308685565fc47258f9adb5f09875bd0',
          apGroupName: 'bbb',
          vlanId: 1
        }]
      }
    ]

    const requestSpy = jest.fn()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/json',
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json(timezoneRes))
        }
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }

    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00'))) // Australian Eastern Standard Time

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(2))

    const row1 = await screen.findByRole('row', { name: /network-venue-1/i })
    const row2 = await screen.findByRole('row', { name: /My-Venue/i })

    expect(row1).toHaveTextContent('custom')
    expect(row2).toHaveTextContent('2 AP Groups')
    expect(row2).toHaveTextContent('Per AP Group')

    await waitFor(() => expect(row1).toHaveTextContent('OFF now'))
    await waitFor(() => expect(row2).toHaveTextContent('ON now'))

    jest.useRealTimers()
  })

  it('has specific AP groups', async () => {

    const newVenues = [
      {
        ...network.venues[0],
        isAllApGroups: false,
        apGroups: [{
          radio: 'Both',
          radioTypes: ['5-GHz','2.4-GHz', '6-GHz'],
          isDefault: false,
          apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
          id: '6cb1e831973a4d60924ac59f1bda073c',
          apGroupName: 'APG1'
        }],
        scheduler: {
          type: 'ALWAYS_OFF'
        }
      }
    ]

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
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

    const row = await screen.findByRole('row', { name: /network-venue-1/i })

    expect(row).toHaveTextContent('APG1')
    expect(row).toHaveTextContent('All')
    expect(row).toHaveTextContent('VLAN-1 (Custom)')
  })
})
