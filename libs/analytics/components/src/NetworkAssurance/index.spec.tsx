import userEvent from '@testing-library/user-event'

import * as config                           from '@acx-ui/config'
import { useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useLocation, useTenantLink }        from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'
import { cleanup, render, screen, waitFor }  from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import { NetworkAssurance, NetworkAssuranceTabEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn(),
  useTenantLink: jest.fn()
}))

jest.mock('../Header', () => ({
  ...jest.requireActual('../Header'),
  useHeaderExtra: () => [ <div data-testid='HeaderExtra' /> ]
}))
jest.mock('../Health', () => ({
  ...jest.requireActual('../Health'),
  HealthPage: () => <div data-testid='HealthPage' />
}))
jest.mock('../HealthTabs', () => ({
  ...jest.requireActual('../HealthTabs'),
  HealthTabs: () => <div data-testid='HealthTabs' />
}))

jest.mock('../ServiceGuard', () => ({
  ...jest.requireActual('../ServiceGuard'),
  useServiceGuard: () => ({
    title: 'ServiceGuard',
    headerExtra: [],
    component: <div data-testid='ServiceGuard' />
  })
}))

jest.mock('../VideoCallQoe', () => ({
  ...jest.requireActual('../VideoCallQoe'),
  useVideoCallQoe: () => ({
    title: 'VideoCallQoe',
    headerExtra: [],
    component: <div data-testid='VideoCallQoe' />
  })
}))

jest.mock('../ConfigChange', () => ({
  ...jest.requireActual('../ConfigChange'),
  ConfigChange: () => <div data-testid='ConfigChange' />
}))

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

describe('NetworkAssurance', () => {
  const location = {
    pathname: '/t1/t/dashboard',
    key: '123',
    state: {},
    search: '',
    hash: ''
  }
  const basePath = {
    pathname: '/tenant-id/t/analytics',
    search: '',
    hash: ''
  }
  beforeEach(() => {
    jest.mocked(useLocation).mockReturnValue(location)
    jest.mocked(useTenantLink).mockReturnValue(basePath)
    setRaiPermissions({
      READ_HEALTH: true,
      READ_SERVICE_VALIDATION: true,
      READ_CONFIG_CHANGE: true,
      READ_VIDEO_CALL_QOE: true
    } as RaiPermissions)
  })
  afterEach(() => {
    get.mockReturnValue('')
    jest.clearAllMocks()
  })
  it('should render health', async () => {
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('HealthPage')).toBeVisible()
  })
  it('should render service guard', async () => {
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ServiceGuard')).toBeVisible()
  })
  it('should hide video call qoe when IS_MLISA_SA', async () => {
    get.mockReturnValue('true')
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByText('VideoCallQoe')).toBeNull()
  })
  it('should render video call qoe when feature flag VIDEO_CALL_QOE is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.VIDEO_CALL_QOE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('VideoCallQoe')).toBeVisible()
  })
  it('should handle tab click', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('ServiceGuard'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/serviceValidation', hash: '', search: ''
    }))
    userEvent.click(await screen.findByText('VideoCallQoe'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/videoCallQoe', hash: '', search: ''
    }))
  })
  it('should navigate to right path when click on health', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('Health'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/health', hash: '', search: ''
    }))
  })
  it('should render config change when IS_MLISA_SA', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    get.mockReturnValue('true')
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.CONFIG_CHANGE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('Network Assurance')).toBeVisible()
    expect(await screen.findByTestId('ConfigChange')).toBeVisible()
  })
  it('renders only health', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    setRaiPermissions({
      READ_HEALTH: true,
      READ_SERVICE_VALIDATION: false,
      READ_CONFIG_CHANGE: false,
      READ_VIDEO_CALL_QOE: false
    } as RaiPermissions)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('HealthTabs')).toBeVisible()
  })
  it('renders only config change', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    setRaiPermissions({
      READ_HEALTH: false,
      READ_SERVICE_VALIDATION: false,
      READ_CONFIG_CHANGE: true,
      READ_VIDEO_CALL_QOE: false
    } as RaiPermissions)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.CONFIG_CHANGE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ConfigChange')).toBeVisible()
  })
  it('should render header with correct options for health pages', async () => {
    const tabs = ['overview', 'wireless', 'wired']
    for(const tab of tabs) {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      jest.mocked(useTenantLink).mockReturnValue({
        pathname: 't1/t/ai',
        search: '',
        hash: ''
      })
      jest.mocked(useLocation).mockReturnValue({
        ...location,
        pathname: `t1/t/ai/health/${tab}`
      })
      cleanup()
      render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
        { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
      expect(await screen.findByTestId('HealthTabs')).toBeVisible()
    }
  })
})
