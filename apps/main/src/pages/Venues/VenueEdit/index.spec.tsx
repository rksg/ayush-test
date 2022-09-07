import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                         from '@acx-ui/rc/utils'
import {
  UNSAFE_NavigationContext as NavigationContext
} from '@acx-ui/react-router-dom'
import { Provider }                                                         from '@acx-ui/store'
import { render, screen, fireEvent, mockServer, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { VenueEdit } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

const mockVenueCaps = {
  apModels: [{
    ledOn: true,
    model: 'E510'
  }, {
    ledOn: true,
    model: 'H320'
  }, {
    ledOn: true,
    model: 'H350'
  }],
  version: '6.0.0.x.xxx'
}
const mockVenueLed = [{
  ledEnabled: true,
  model: 'E510'
}]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('VenueEdit', () => {
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
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueCapabilities.url,
        (_, res, ctx) => res(ctx.json(mockVenueCaps))),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json(mockVenueLed)))
    )

    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi',
      activeSubTab: 'settings'
    }
    render(
      <Provider>
        <NavigationContext.Provider
          value={{ navigator: { block: (blocker) => blocker, createHref: jest.fn } }}
        >
          <VenueEdit />
        </NavigationContext.Provider>
      </Provider>, { 
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await screen.findByRole('tab', { name: 'Advanced Settings' })
    fireEvent.click(await screen.findByText('Advanced Settings'))
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('E510')
    fireEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    fireEvent.click(await screen.findByText('Cancel'))

    // TODO:
    // const dialog = await screen.findByRole('dialog')
    // await screen.findByText('You Have Unsaved Changes')
    // fireEvent.click(await screen.findByRole('button', { name: 'Save Changes' }))
  })

})
