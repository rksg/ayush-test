import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { render, screen, fireEvent, mockServer, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venueData,
  venueCaps,
  venueLed
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
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json(venueLed)))
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><VenueEdit /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
    await screen.findByRole('tab', { name: 'Venue Details' })
    await screen.findByRole('tab', { name: 'Wi-Fi Configuration' })
    await screen.findByRole('tab', { name: 'Switch Configuration' })
  })

  it('should handle tab changes', async () => {
    render(<Provider><VenueEdit /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByRole('tab', { name: 'Wi-Fi Configuration' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/edit/wifi/radio`,
      hash: '',
      search: ''
    })
    fireEvent.click(await screen.findByRole('tab', { name: 'Venue Details' }))
    fireEvent.click(await screen.findByRole('tab', { name: 'Switch Configuration' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/edit/switch/general`,
      hash: '',
      search: ''
    })
  })

  it('should handle back button', async () => {
    render(<Provider><VenueEdit /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByText('Back to venue details'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })

  it('should handle unsaved changes', async () => {
    jest.mock('react', () => ({
      ...jest.requireActual('react'),
      useRef: jest.fn(() => ({
        current: jest.fn(() => null)
      }))
    }))

    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi',
      activeSubTab: 'settings'
    }
    render(<Provider><VenueEdit /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
    })

    await screen.findByRole('tab', { name: 'Advanced Settings' })
    fireEvent.click(await screen.findByText('Advanced Settings'))
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('E510')
    fireEvent.click(await screen.findByRole('button', { name: 'Add Model' }))

    const toggle = screen.getAllByRole('switch')
    fireEvent.click(toggle[0])

    fireEvent.click(await screen.findByText('Back to venue details'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })

    // TODO: Test for Unsaved Changes Modal
    // const dialog = await screen.findByRole('dialog')
    // await screen.findByText('You Have Unsaved Changes')
    // fireEvent.click(await screen.findByRole('button', { name: 'Save Changes' }))
  })

})
