import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                                           from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, CommonUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved }     from '@acx-ui/test-utils'

import {
  venueApsList,
  venueCaps,
  venueData,
  venueSetting,
  venueLanPorts,
  mockCellularSettings,
  mockRadiusOptions,
  mockDirectedMulticast
} from '../../../__tests__/fixtures'

import { NetworkingTab } from '.'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('NetworkingTab', () => {
  const mockGetApsList = jest.fn()
  beforeEach(() => {
    mockGetApsList.mockClear()
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.get(
        WifiRbacUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.put(
        CommonUrlsInfo.updateVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(
        CommonRbacUrlsInfo.updateVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => {
          mockGetApsList()
          return res(ctx.json(venueApsList))
        }),
      rest.get(WifiUrlsInfo.getVenueDirectedMulticast.url,
        (_, res, ctx) => res(ctx.json(mockDirectedMulticast))
      ),
      rest.put(WifiUrlsInfo.updateApDirectedMulticast.url,
        (_req, res, ctx) => res(ctx.status(200))
      ),
      rest.get(
        CommonUrlsInfo.getVenueRadiusOptions.url,
        (_, res, ctx) => res(ctx.json(mockRadiusOptions))
      ),
      rest.put(
        CommonUrlsInfo.updateVenueRadiusOptions.url,
        (_req, res, ctx) => res(ctx.status(200))
      ),
      rest.get(
        WifiUrlsInfo.getVenueApModelCellular.url,
        (_req, res, ctx) => res(ctx.json(mockCellularSettings))
      ),
      rest.get(
        WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      // rbac
      rest.get(
        WifiRbacUrlsInfo.getVenueRadiusOptions.url,
        (_, res, ctx) => res(ctx.json(mockRadiusOptions))
      ),
      rest.get(WifiRbacUrlsInfo.getVenueDirectedMulticast.url,
        (_, res, ctx) => res(ctx.json(mockDirectedMulticast))
      ),
      rest.get(
        WifiRbacUrlsInfo.getVenueApModelCellular.url,
        (_req, res, ctx) => res(ctx.json(mockCellularSettings))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><NetworkingTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(await waitFor(() => screen.findByText('AP Model'))).toBeVisible()
  })
  it('should handle update setting', async () => {
    render(<Provider><NetworkingTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    await userEvent.click(screen.getByTestId('mesh-switch'))
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
  it('should navigate to venue list page when clicking cancel button', async () => {
    render(<Provider><NetworkingTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues`,
      hash: '',
      search: ''
    })
  })

  it('should show Directed Multicast if feature flag is On', async () => {
    render(<Provider><NetworkingTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))
    await waitFor(() => expect(mockGetApsList).toBeCalled())

    await waitFor(() => screen.findByText('Multicast Traffic from:'))
    await userEvent.click(screen.getByTestId('network-switch'))
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should show Radius Options if feature flag is On', async () => {
    render(<Provider><NetworkingTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => expect(mockGetApsList).toBeCalled())
    await waitFor(() => screen.findByText('Override the settings in active networks'))

    userEvent.click(
      await screen.findByRole('switch', { name: 'Override the settings in active networks' })
    )
    const nasIdField = await screen.findByText('NAS ID')
    expect(nasIdField).toBeInTheDocument()
  })
})
