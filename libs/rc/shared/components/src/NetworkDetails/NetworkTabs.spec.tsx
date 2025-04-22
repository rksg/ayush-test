import '@testing-library/jest-dom'
import { rest } from 'msw'

import { get }                                                               from '@acx-ui/config'
import { useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { CommonRbacUrlsInfo }                                                from '@acx-ui/rc/utils'
import { generatePath }                                                      from '@acx-ui/react-router-dom'
import { Provider }                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor, fireEvent }                    from '@acx-ui/test-utils'
import { getUserProfile, RaiPermissions, setRaiPermissions, setUserProfile } from '@acx-ui/user'
import { AccountTier }                                                       from '@acx-ui/utils'

import { networkDetailHeaderData } from './__tests__/fixtures'
import NetworkTabs                 from './NetworkTabs'

const params = { networkId: 'network-id', tenantId: 'tenant-id' }
const url = generatePath(CommonRbacUrlsInfo.getNetworksDetailHeader.url, params)
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('NetworkTabs', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(url, (_, res, ctx) => res(ctx.json(networkDetailHeaderData)))
    )
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    await screen.findByText('Overview')
    await screen.findByText('APs (0)')
    await screen.findByText('Venues (0)')
    await screen.findByText('Timeline')
    await screen.findByText('Incidents')
    await screen.findByText('Clients ()')
    await waitFor(() => screen.findByText('APs (1)'))
    await waitFor(() => screen.findByText('Venues (1)'))
    await waitFor(() => screen.findByText('Clients (1)'))
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

  it('should hide incidents when READ_INCIDENTS permission is false', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
    render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    expect(screen.queryByText('Incidents')).toBeNull()
  })

  it('should hide incidents with Core Tier', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })
    render(<Provider><NetworkTabs /></Provider>, { route: { params } })
    expect(screen.queryByText('Incidents')).toBeNull()
  })
})
