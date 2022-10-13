import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                                   from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venueApsList,
  venueCaps,
  venueData,
  venueSetting,
  venueLanPorts
} from '../../../__tests__/fixtures'

import { NetworkingTab } from './'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('NetworkingTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
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
        CommonUrlsInfo.getVenueCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.put(
        CommonUrlsInfo.updateVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(venueApsList)))
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><NetworkingTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle update setting', async () => {
    render(<Provider><NetworkingTab /></Provider>
      , { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    // update LAN ports
    fireEvent.mouseDown(screen.getByLabelText('AP Model'))
    const option = screen.getByText('H320')
    await userEvent.click(option)
    const tabPanel = screen.getByRole('tabpanel', { hidden: false })
    fireEvent.click(within(tabPanel).getByLabelText(/Enable port/))
    expect(within(tabPanel).getByLabelText(/Enable port/)).toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
  it('should navigate to venue details page when clicking cancel button', async () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi',
      activeSubTab: 'networking'
    }
    render(
      <Provider>
        <NetworkingTab />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })
})
