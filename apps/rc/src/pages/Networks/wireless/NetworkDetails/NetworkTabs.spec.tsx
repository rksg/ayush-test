import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                 from '@acx-ui/rc/utils'
import { generatePath }                                   from '@acx-ui/react-router-dom'
import { Provider }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'
import { RolesEnum }                                      from '@acx-ui/types'
import { getUserProfile, setUserProfile }                 from '@acx-ui/user'

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

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('NetworkTabs', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(url, (_, res, ctx) => res(ctx.json(networkDetailHeaderData)))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    await screen.findByText('Overview')
    await screen.findByText('APs (0)')
    await screen.findByText('Venues (0)')
    await screen.findByText('Timeline')
    await screen.findByText('Incidents')
    await waitFor(() => screen.findByText('APs (1)'))
    await waitFor(() => screen.findByText('Venues (1)'))
  })

  it('should handle tab changes', async () => {
    render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    await waitFor(() => screen.findByText('APs (1)'))
    fireEvent.click(await screen.findByText('APs (1)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/networks/wireless/${params.networkId}/network-details/aps`,
      hash: '',
      search: ''
    })
  })

  it('should hide incidents when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    expect(screen.queryByText('Incidents')).toBeNull()
  })
})
