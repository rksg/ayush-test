/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { rest } from 'msw'

import * as config           from '@acx-ui/config'
import { useSplitTreatment } from '@acx-ui/feature-toggle'
import { networkApi }        from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
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

import {
  network,
  user,
  list,
  timezoneRes,
  params
} from './NetworkVenueTestData'

import { NetworkVenuesTab } from './index'

jest.mock('socket.io-client')

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
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )

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
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    jest.mocked(useSplitTreatment).mockReturnValue(true)

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
          vlanPoolId: '1c061cf2649344adaf1e79a9d624a451',
          vlanPoolName: 'pool1'
        }]
      }
    ]
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.post(
        WifiUrlsInfo.addNetworkVenue.url,
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
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
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
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
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
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
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
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      )
    )
    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
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
        WifiUrlsInfo.getNetwork.url,
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
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkVenue.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /network-venue-1/i })

    expect(row).toHaveTextContent('APG1')
    expect(row).toHaveTextContent('All')
    expect(row).toHaveTextContent('VLAN-1 (Custom)')

    fireEvent.click(within(row).getByText('APG1'))
    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    fireEvent.click(within(row).getByText('VLAN-1 (Custom)'))
    // Switch to 'All APs' radio
    fireEvent.click(within(dialog).getByLabelText('All APs', { exact: false }))

    // Switch to 'AP groups' radio
    fireEvent.click(within(dialog).getByLabelText('Select specific AP groups', { exact: false }))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
  })


  it('setup NetworkApGroupDialog', async () => {

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json(user))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkVenue.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /network-venue-1/i })

    fireEvent.click(within(row).getByText('All APs'))

    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    // click 'x' of Radio tag '5 GHz'
    const radioTag = within(dialog).getByTitle('5 GHz')
    fireEvent.click(within(radioTag).getByRole('img', { name: 'close', hidden: true }))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
  })
})
