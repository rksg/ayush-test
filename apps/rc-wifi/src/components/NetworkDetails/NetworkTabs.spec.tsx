import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                 from '@acx-ui/rc/utils'
import { generatePath }                                   from '@acx-ui/react-router-dom'
import { Provider }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import NetworkTabs from './NetworkTabs'

const networkDetailHeaderData = {
  activeVenueCount: 1,
  aps: {
    totalApCount: 1
  }
}
const params = { networkId: 'network-id', tenantId: 'tenant-id' }
const url = generatePath(CommonUrlsInfo.getNetworksDetailHeader.url, params)
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('NetworkTabs', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(url, (req, res, ctx) => res(ctx.json(networkDetailHeaderData)))
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
    await screen.findByText('Overview')
    await screen.findByText('APs (0)')
    await screen.findByText('Venues (0)')
    await screen.findByText('Services (0)')
    await screen.findByText('Events')
    await screen.findByText('Incidents')
    await waitFor(() => screen.findByText('APs (1)'))
    await waitFor(() => screen.findByText('Venues (1)'))
  })

  it('should handle tab changes', async () => {
    render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    await waitFor(() => screen.findByText('APs (1)'))
    fireEvent.click(await screen.findByText('APs (1)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/networks/${params.networkId}/network-details/aps`,
      hash: '',
      search: ''
    })
  })
})
