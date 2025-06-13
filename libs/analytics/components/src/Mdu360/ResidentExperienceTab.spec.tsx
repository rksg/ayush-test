
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ResidentExperienceTab from './ResidentExperienceTab'

const mockNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: jest.fn().mockReturnValue({ activeTab: 'networkOverview' }),
  useNavigate: () => mockNavigate,
  useTenantLink: jest.fn().mockReturnValue({ pathname: '/t1/v/mdu360' })
}))

jest.mock('./widgets/WifiClient', () => ({
  WifiClient: jest.fn(() => <div>Wi-Fi Client</div>)
}))

jest.mock('./widgets/WifiClientCapability', () => ({
  WifiClientCapability: jest.fn(() => <div>Wi-Fi Client Capability</div>)
}))


describe('ResidentExperienceTab', () => {

  it('renders ResidentExperienceTab correct', async () => {

    render(<ResidentExperienceTab
      startDate='2023-02-01T00:00:00.000Z'
      endDate='2023-02-01T00:00:00.000Z' />, { wrapper: Provider })

    expect(await screen.findByText('Wi-Fi Client')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Client Capability')).toBeVisible()

  })

})