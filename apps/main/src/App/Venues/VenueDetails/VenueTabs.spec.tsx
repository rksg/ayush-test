import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                                       from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                 from '@acx-ui/rc/utils'
import { generatePath }                                   from '@acx-ui/react-router-dom'
import { Provider, store }                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import VenueTabs from './VenueTabs'

const venueDetailHeaderData = {
  activeNetworkCount: 1,
  aps: {
    totalApCount: 1
  },
  totalClientCount: 2
}
const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const url = generatePath(CommonUrlsInfo.getVenueDetailsHeader.url, params)
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('VenueTabs', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(url, (_, res, ctx) => res(ctx.json(venueDetailHeaderData)))
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><VenueTabs /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
    await screen.findByText('Overview')
    await screen.findByText('AI Analytics')
    await screen.findByText('Clients (0)')
    await screen.findByText('Devices (0)')
    await screen.findByText('Networks (0)')
    await screen.findByText('Services (0)')
    await screen.findByText('Timeline')
    await waitFor(() => screen.findByText('Clients (2)'))
    await waitFor(() => screen.findByText('Networks (1)'))
    await waitFor(() => screen.findByText('Devices (1)'))
  })

  it('should handle tab changes', async () => {
    render(<Provider><VenueTabs /></Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Clients (2)'))
    fireEvent.click(await screen.findByText('Clients (2)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/clients`,
      hash: '',
      search: ''
    })
  })
})
