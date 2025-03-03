import { Navigate, useSearchParams } from 'react-router-dom'

import { getUserProfile }                                        from '@acx-ui/analytics/utils'
import { get }                                                   from '@acx-ui/config'
import { Provider }                                              from '@acx-ui/store'
import { render, screen }                                        from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions, raiPermissionsList } from '@acx-ui/user'

import AllRoutes from './AllRoutes'

jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object
    .keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(sets)
})
jest.mock('./pages/Dashboard', () => () => <div data-testid='Dashboard' />)
jest.mock('./pages/ZoneDetails', () => () => <div data-testid='ZoneDetails' />)
jest.mock('./pages/Zones', () => () => <div data-testid='ZonesList' />)

jest.mock('@reports/Routes', () => () => {
  return <div data-testid='reports' />
}, { virtual: true })
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))
jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(() => <div />),
  useSearchParams: jest.fn(() => [new URLSearchParams()])
}))
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn(),
  updateSelectedTenant: jest.fn()
}))
const userProfile = jest.mocked(getUserProfile)

const defaultReportsPermissions = {
  READ_DASHBOARD: false,
  READ_HEALTH: false,
  READ_REPORTS: false,
  READ_DATA_STUDIO: false,
  READ_DATA_CONNECTOR: false,
  READ_DATA_CONNECTOR_STORAGE: false
}

describe('AllRoutes', () => {
  const defaultUserProfile = {
    accountId: 'aid',
    tenants: [{ id: 'aid', permissions: { READ_ONBOARDED_SYSTEMS: true } }],
    invitations: [],
    selectedTenant: {
      id: 'aid',
      permissions: {}
    }
  }
  beforeEach(() => {
    jest.mocked(get).mockReturnValue('true')
    setRaiPermissions(Object.keys(raiPermissionsList)
      .reduce((permissions, name) => ({ ...permissions, [name]: true }), {} as RaiPermissions))
    userProfile.mockReturnValue(defaultUserProfile)
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
  })

  it('redirects analytics users to dashboard', async () => {
    render(<AllRoutes />, { route: { path: '/ai' }, wrapper: Provider })
    expect(Navigate).toHaveBeenCalledWith({
      replace: true,
      to: { pathname: '/ai/dashboard', search: '?selectedTenants=WyJhaWQiXQ==' }
    }, {})
  })

  it('redirects report users to reports', async () => {
    setRaiPermissions({ ...defaultReportsPermissions, READ_REPORTS: true } as RaiPermissions)
    render(<AllRoutes />, { route: { path: '/ai' }, wrapper: Provider })
    expect(Navigate).toHaveBeenCalledWith({
      replace: true,
      to: { pathname: '/ai/reports', search: '?selectedTenants=WyJhaWQiXQ==' }
    }, {})
  })

  it('redirects it helpdesk to health', async () => {
    setRaiPermissions({ ...defaultReportsPermissions, READ_HEALTH: true } as RaiPermissions)
    render(<AllRoutes />, { route: { path: '/ai' }, wrapper: Provider })
    expect(Navigate).toHaveBeenCalledWith({
      replace: true,
      to: { pathname: '/ai/health', search: '?selectedTenants=WyJhaWQiXQ==' }
    }, {})
  })

  it('redirects data studio users to data studio', async () => {
    setRaiPermissions({ ...defaultReportsPermissions, READ_DATA_STUDIO: true } as RaiPermissions)
    render(<AllRoutes />, { route: { path: '/ai' }, wrapper: Provider })
    expect(Navigate).toHaveBeenCalledWith({
      replace: true,
      to: { pathname: '/ai/reports', search: '?selectedTenants=WyJhaWQiXQ==' }
    }, {})
  })

  it('redirects to data connector', async () => {
    setRaiPermissions({
      ...defaultReportsPermissions,
      READ_DATA_CONNECTOR: true } as RaiPermissions)
    render(<AllRoutes />, { route: { path: '/ai' }, wrapper: Provider })
    expect(Navigate).toHaveBeenCalledWith({
      replace: true,
      to: { pathname: '/ai/dataConnector', search: '?selectedTenants=WyJhaWQiXQ==' }
    }, {})
  })

  it('redirects to profile by default', async () => {
    setRaiPermissions({ READ_DASHBOARD: false } as RaiPermissions)
    render(<AllRoutes />, { route: { path: '/ai' }, wrapper: Provider })
    expect(Navigate).toHaveBeenCalledWith({
      replace: true,
      to: { pathname: '/ai/profile/settings', search: '?selectedTenants=WyJhaWQiXQ==' }
    }, {})
  })

  it('redirects to return url', async () => {
    const search = new URLSearchParams()
    search.set('return', '/ai/incidents?selectedTenants=WyJhaWQiXQ==')
    jest.mocked(useSearchParams).mockReturnValue([search, () => {}])
    render(<AllRoutes />, { route: { path: '/ai' }, wrapper: Provider })
    expect(Navigate).toHaveBeenCalledWith({
      replace: true,
      to: '/ai/incidents?selectedTenants=WyJhaWQiXQ=='
    }, {})
  })

  it('should render incidents correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/incidents' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('AIAnalytics')).toBeVisible()
  })
  it('should render Inten AI correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/intentAI' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('AIAnalytics')).toBeVisible()
  })

  it('should render incident details correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/incidents/id' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('IncidentDetails')).toBeVisible()
  })

  it('should render config change correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/configChange' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('NetworkAssurance')).toBeVisible()
  })
  it('should render health page correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/health' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('NetworkAssurance')).toBeVisible()
  })
  it('should render video call qoe correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/videoCallQoe' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoe')).toBeVisible()
  })
  it('should render video call qoe details correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/videoCallQoe/id' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoeDetails')).toBeVisible()
  })
  it('should render video call qoe form correctly', async () => {
    render(<AllRoutes />,
      { route: { path: '/ai/videoCallQoe/add' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoeForm')).toBeVisible()
  })
  it('should render crrm correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/crrm' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('AIAnalytics')).toBeVisible()
  })
  it('should render aiOps correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/aiOps' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('AIAnalytics')).toBeVisible()
  })
  it('should render crrm details correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/crrm/test-recommendation-id' },
      wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('CrrmDetails')).toBeVisible()
  })
  it('should render unknown details correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/crrm/unknown/*' },
      wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('UnknownDetails')).toBeVisible()
  })
  it('should render aiOps details correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/aiOps/test-recommendation-id' },
      wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('RecommendationDetails')).toBeVisible()
  })
  it('should render Dashboard', async () => {
    const path = '/ai/dashboard'
    render(<AllRoutes />, { route: { path } })
    expect(await screen.findByTestId('Dashboard')).toBeVisible()
  })
  it('should render reports correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/reports/overview' }
      , wrapper: Provider })
    await screen.findByTestId('reports')
  })
  it('should render datastudio correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/dataStudio' }
      , wrapper: Provider })
    await screen.findByTestId('reports')
  })
  it('should render Data Connector correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/dataConnector' }
      , wrapper: Provider })
    await screen.findByTestId('reports')
  })
  it('should render zone list correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/zones' }
      , wrapper: Provider })
    await screen.findByTestId('ZonesList')
  })
  it('should render zone details correctly', async () => {
    render(<AllRoutes />, { route: {
      path: '/ai/zones/systemName/zoneName/analytics' }
    , wrapper: Provider })
    await screen.findByTestId('ZoneDetails')
  })
  it('should render zone details tab correctly', async () => {
    render(<AllRoutes />, { route: {
      path: '/ai/zones/systemName/zoneName/analytics/incidents' }
    , wrapper: Provider })
    await screen.findByTestId('ZoneDetails')
  })
  it('should render zone details subtab correctly', async () => {
    render(<AllRoutes />, { route: {
      path: '/ai/zones/systemName/zoneName/analytics/incidents/overview' }
    , wrapper: Provider })
    await screen.findByTestId('ZoneDetails')
  })
  it('should render support correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/admin/support' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('AccountManagement')).toBeVisible()
  })
  it('should render support onboarded systems', async () => {
    render(<AllRoutes />, { route: { path: '/ai/admin/onboarded' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('AccountManagement')).toBeVisible()
  })
  it('should render profile correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/profile/settings' }, wrapper: Provider })
    expect(await screen.findByAltText('Logo')).toBeVisible()
    expect(await screen.findByTestId('Profile')).toBeVisible()
  })
})
