import '@testing-library/jest-dom'

import { rest } from 'msw'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { ClientUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { VenueClientsTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

describe('VenueClientsTab', () => {
  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true) // Features.DEVICES

    mockServer.use(
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 2, page: 1, data: []
        }))
      ),
      rest.post(
        ClientUrlsInfo.getClientMeta.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7'
    }
    render(<Provider><VenueClientsTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/clients/wifi' }
    })
    const wifiTab = await screen.findByRole('tab', { name: 'Wi-Fi' })
    expect(wifiTab.getAttribute('aria-selected')).toBeTruthy()

    const switchTab = await screen.findByRole('tab', { name: 'Switch' })
    fireEvent.click(switchTab)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/venue-details/clients/switch`,
      hash: '',
      search: ''
    })
  })
})
