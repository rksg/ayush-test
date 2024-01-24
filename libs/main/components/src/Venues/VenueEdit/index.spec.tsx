import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed }        from '@acx-ui/feature-toggle'
import { venueApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { render, screen, fireEvent, mockServer } from '@acx-ui/test-utils'

import {
  venueData,
  venueCaps,
  venueLed,
  venueApModels
} from '../__tests__/fixtures'

import { VenueEdit } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('VenueEdit', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json(venueLed))),
      rest.get(CommonUrlsInfo.getVenueApModels.url,
        (_, res, ctx) => res(ctx.json(venueApModels)))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><VenueEdit /></Provider>, { route: { params } })
    await screen.findByRole('tab', { name: 'Venue Details' })
    await screen.findByRole('tab', { name: 'Wi-Fi Configuration' })
    await screen.findByRole('tab', { name: 'Switch Configuration' })
    await screen.findByRole('tab', { name: 'Property Management' })
    expect(await screen.findByText('Back to venue details')).toBeVisible()
  })

  it('should handle tab changes', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><VenueEdit /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByRole('tab', { name: 'Wi-Fi Configuration' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/edit/wifi/radio`,
      hash: '',
      search: ''
    })
    fireEvent.click(await screen.findByRole('tab', { name: 'Venue Details' }))
    fireEvent.click(await screen.findByRole('tab', { name: 'Switch Configuration' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/edit/switch/general`,
      hash: '',
      search: ''
    })
  })

  it('should handle back button', async () => {
    render(<Provider><VenueEdit /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByText('Back to venue details'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })
})
