import userEvent from '@testing-library/user-event'

import { get }                                       from '@acx-ui/config'
import { useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { dataApi, dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }         from '@acx-ui/user'

import { mockNetworkHierarchy } from './__tests__/fixtures'

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

jest.mock('../IntentAI', () => ({
  ...jest.requireActual('../IntentAI'),
  IntentAITabContent: () => <div data-testid='intentAI' />
}))


describe('NetworkAssurance', () => {
  beforeEach(() => {
    setRaiPermissions({
      READ_INCIDENTS: true,
      READ_AI_OPERATIONS: true,
      READ_AI_DRIVEN_RRM: true,
      READ_INTENT_AI: true
    } as RaiPermissions)
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', { data: mockNetworkHierarchy })
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('should render incidents', async () => {
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('Incidents')).toBeVisible()
    expect(await screen.findByTestId('HeaderExtra')).toBeVisible()
  })
  it('should render IntentAI tab', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGet.mockReturnValue(true)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INTENTAI}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('intentAI')).toBeVisible()
  })
  it('should not render IntentAI tab when FF or permission not enabled', async () => {
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INTENTAI}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(screen.queryByTestId('intentAI')).not.toBeInTheDocument()
  })
  it('should handle intent tab click in R1', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true) // intentAI enabled
    mockGet.mockReturnValue(false)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('IntentAI'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/intentAI', hash: '', search: ''
    }))
  })
  it('should handle recommendation tab click in RA SA', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false) // intentAI not enabled
    mockGet.mockReturnValue(true)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('AI-Driven RRM'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/ai/recommendations/crrm', hash: '', search: ''
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
  it('should not render config recommendation tabs for RA SA when not admin', async () => {
    jest.mocked(mockGet).mockReturnValue(true)
    setRaiPermissions({
      READ_AI_OPERATIONS: false,
      READ_AI_DRIVEN_RRM: false
    } as RaiPermissions)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.CRRM}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(screen.getByText('AI Analytics')).toBeVisible()
    expect(screen.queryByTestId('HeaderExtra')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Recommendations')).not.toBeInTheDocument()
  })
  it('should render config recommendation tab for R1', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false) // intentAI not enabled
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
})
