import userEvent from '@testing-library/user-event'

import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { NetworkAssurance, NetworkAssuranceTabEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../Header', () => ({
  ...jest.requireActual('../Header'),
  useHeaderExtra: () => [ <div data-testid='HeaderExtra' /> ]
}))
jest.mock('../Health', () => ({
  ...jest.requireActual('../Health'),
  HealthPage: () => <div data-testid='HealthPage' />
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
  useConfigChange: () => ({
    headerExtra: [<div data-testid='HeaderExtra' />],
    component: <div data-testid='ConfigChange' />
  })
}))

describe('NetworkAssurance', () => {
  it('should render health', async () => {
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('HealthPage')).toBeVisible()
  })
  it('should render serivce guard', async () => {
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ServiceGuard')).toBeVisible()
  })
  it('should render video call qoe', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.VIDEO_CALL_QOE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('VideoCallQoe')).toBeVisible()
  })
  it('should hide video call qoe when feature flag VIDEO_CALL_QOE is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByText('VideoCallQoe')).toBeNull()

    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.SERVICE_GUARD}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByText('VideoCallQoe')).toBeNull()

    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.VIDEO_CALL_QOE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByTestId('VideoCallQoe')).toBeNull()
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
  it('should render config change', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.CONFIG_CHANGE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('Network Assurance')).toBeVisible()
    expect(await screen.findByTestId('ConfigChange')).toBeVisible()
    expect(await screen.findByTestId('HeaderExtra')).toBeVisible()
  })
  it('should hide config change when feature flag CONFIG_CHANGE is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.HEALTH}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByText('Config Change')).toBeNull()

    render(<NetworkAssurance tab={NetworkAssuranceTabEnum.CONFIG_CHANGE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByText('Config Change')).toBeNull()
  })
})