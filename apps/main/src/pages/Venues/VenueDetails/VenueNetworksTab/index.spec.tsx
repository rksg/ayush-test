/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

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
  venueNetworkList,
  networkDeepList,
  venueNetworkApGroup
} from '../../__tests__/fixtures'

import { VenueNetworksTab } from './index'

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`dialog-${name}`} title={name} />,
  { virtual: true })

describe('VenueNetworksTab', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
      ),
      rest.post(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    const params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      venueId: '3b2ffa31093f41648ed38ed122510029'
    }

    const { asFragment } = render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/networks' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('test_1')
    expect(asFragment()).toMatchSnapshot()
  })

  it('activate Network', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
      ),
      rest.post(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    const params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      venueId: '3b2ffa31093f41648ed38ed122510029'
    }

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/networks' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const newApGroup = JSON.parse(JSON.stringify(venueNetworkApGroup))
    newApGroup.response[1].apGroups[0].id = 'test2'
    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(newApGroup))
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
  })

  it('deactivate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
      ),
      rest.post(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    const params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      venueId: '3b2ffa31093f41648ed38ed122510029'
    }

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/networks' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const requestSpy = jest.fn()

    const newApGroup = JSON.parse(JSON.stringify(venueNetworkApGroup))
    newApGroup.response[0].apGroups[0].id = ''
    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(newApGroup))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ requestId: '456' }))
        }
      )
    )

    const toogleButton = await screen.findByRole('switch', { checked: true })
    fireEvent.click(toogleButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
  })

  it('click VLAN, APs, Radios', async () => {
    const params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      venueId: '3b2ffa31093f41648ed38ed122510029'
    }
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
      ),
      rest.post(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/networks' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /test_1/i })

    fireEvent.click(within(row).getByText('VLAN-1 (Default)'))
    fireEvent.click(within(row).getByText('2.4 GHz, 5 GHz'))
    fireEvent.click(within(row).getByText('All APs'))

    const dialog = await waitFor(async () => screen.findByTestId(/^dialog/))

    expect(dialog).toBeVisible()
  })
})
