import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { useLocation, useTenantLink }                         from '@acx-ui/react-router-dom'
import { Provider, dataApiURL, store }                        from '@acx-ui/store'
import { cleanup, render, screen, mockGraphqlQuery, waitFor } from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }                  from '@acx-ui/user'

import { switchCountFixture } from '../HealthTabs/OverviewTab/SummaryBoxes/__tests__/fixtures'
import { api }                from '../HealthTabs/OverviewTab/SummaryBoxes/services'

import { HealthPageWithTabs, HealthTabEnum } from './HealthPageWithTabs'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: jest.fn(() => ({ filters: { filter: '', startDate: '', endDate: '' } }))
}))
const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: jest.fn(),
  useLocation: jest.fn()
}))
jest.mock('../Header', () => ({
  useHeaderExtra: jest.fn(() => [])
}))
jest.mock('../HealthTabs/OverviewTab', () => ({
  OverviewTab: jest.fn(() => <div data-testid='OverviewTab'/>)
}))
jest.mock('../Health', () => ({
  ...jest.requireActual('../Health'),
  HealthPage: () => <div data-testid='WirelessTab' />
}))
jest.mock('../HealthTabs/WiredTab', () => ({
  WiredTab: jest.fn(() => <div data-testid='WiredTab'/>)
}))

const params = { tenantId: 'tenant-id' }

describe('HealthPageWithTabs', () => {
  const location = {
    pathname: '/t1/t/dashboard',
    key: '123',
    state: {},
    search: '',
    hash: ''
  }
  const basePath = {
    pathname: '/tenant-id/t/analytics/health',
    search: '',
    hash: ''
  }

  afterEach(() => {
    store.dispatch(api.util.resetApiState())
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.mocked(useLocation).mockReturnValue(location)
    jest.mocked(useTenantLink).mockReturnValue(basePath)

    mockGraphqlQuery(dataApiURL, 'SwitchCount', { data: switchCountFixture })
    setRaiPermissions({
      READ_HEALTH: true
    } as RaiPermissions)
  })
  const renderComponent = (tab: HealthTabEnum) => {
    return render(
      <Provider>
        <HealthPageWithTabs tab={tab} />
      </Provider>,
      { route: { params } }
    )
  }

  it('renders the Overview tab', async () => {
    renderComponent(HealthTabEnum.OVERVIEW)
    expect(await screen.findByTestId('OverviewTab')).toBeInTheDocument()
  })

  it('renders the Wired tab', async () => {
    renderComponent(HealthTabEnum.WIRED)
    expect(await screen.findByTestId('WiredTab')).toBeInTheDocument()
  })

  it('should not render the health tabs if no Health permission', () => {
    setRaiPermissions({ READ_HEALTH: false } as RaiPermissions)
    renderComponent(HealthTabEnum.OVERVIEW)
    expect(screen.queryByTestId('HealthTabs')).not.toBeInTheDocument()
  })

  it('renders the correct title', () => {
    renderComponent(HealthTabEnum.OVERVIEW)
    expect(screen.getByText('Health')).toBeInTheDocument()
  })

  it('renders the correct breadcrumb', () => {
    renderComponent(HealthTabEnum.OVERVIEW)
    expect(screen.getByText('AI Assurance')).toBeInTheDocument()
    expect(screen.getByText('Network Assurance')).toBeInTheDocument()
  })

  it('renders the tabs', () => {
    renderComponent(HealthTabEnum.OVERVIEW)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Wireless')).toBeInTheDocument()
    expect(screen.getByText('Wired')).toBeInTheDocument()
  })

  it('should handle tab click', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<HealthPageWithTabs tab={HealthTabEnum.OVERVIEW}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('Wireless'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/health/wireless', search: '', hash: ''
    }))
    userEvent.click(await screen.findByText('Wired'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/health/wired', search: '', hash: ''
    }))
  })
  it('should render header with correct options', async () => {
    const tabs = ['overview', 'wireless', 'wired']
    const tabTitles = ['OverviewTab', 'WirelessTab', 'WiredTab']
    for(const tab of tabs) {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      jest.mocked(useTenantLink).mockReturnValue({
        pathname: 't1/t/analytics/health',
        search: '',
        hash: ''
      })
      jest.mocked(useLocation).mockReturnValue({
        ...location,
        pathname: `t1/t/analytics/health/${tab}`
      })
      cleanup()
      render(<HealthPageWithTabs tab={tab as HealthTabEnum}/>,
        { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
      expect(await screen.findByTestId(tabTitles[tabs.indexOf(tab)])).toBeVisible()
    }
  })
})
