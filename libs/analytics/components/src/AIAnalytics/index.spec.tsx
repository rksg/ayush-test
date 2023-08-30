import userEvent from '@testing-library/user-event'

import { get }                     from '@acx-ui/config'
import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { AIAnalytics, AIAnalyticsTabEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

jest.mock('../Header', () => ({
  ...jest.requireActual('../Header'),
  useHeaderExtra: () => [ <div data-testid='HeaderExtra' /> ]
}))

jest.mock('../Incidents', () => ({
  ...jest.requireActual('../Incidents'),
  IncidentTabContent: () => <div data-testid='Incidents' />
}))

jest.mock('../Recommendations', () => ({
  ...jest.requireActual('../Recommendations'),
  RecommendationTabContent: () => <div data-testid='Recommendations' />
}))

describe('NetworkAssurance', () => {
  it('should render incidents', async () => {
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('Incidents')).toBeVisible()
    expect(await screen.findByTestId('HeaderExtra')).toBeVisible()
  })
  it('should handle recommendation tab click in RA SA', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGet.mockReturnValue(true)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('AI-Driven RRM'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/analytics/next/recommendations/crrm', hash: '', search: ''
    }))
  })
  it('should render config recommendation tab for RA SA', async () => {
    jest.mocked(mockGet).mockReturnValue(true)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.CRRM}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('Recommendations')).toBeVisible()
    expect(await screen.findByTestId('HeaderExtra')).toBeVisible()
  })
  it('should render config recommendation tab for R1 when feature flag is ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(mockGet).mockReturnValue(false)
    render(<AIAnalytics />, {
      wrapper: Provider,
      route: {
        path: '/:tenantId/t/analytics/recommendations/:activeTab',
        params: { tenantId: 'tenant-id', activeTab: 'crrm' }
      }
    })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeVisible()
  })
  it('should not render config recommendation tab for R1 when feature flag is OFF', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(mockGet).mockReturnValue(false)
    render(<AIAnalytics />, {
      wrapper: Provider,
      route: {
        path: '/:tenantId/t/analytics/recommendations/:activeTab',
        params: { tenantId: 'tenant-id', activeTab: 'crrm' }
      }
    })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeNull()
  })
})