import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { get }                                                   from '@acx-ui/config'
import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { dataApi, dataApiURL, Provider, store, rbacApiURL }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor, mockServer } from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }                     from '@acx-ui/user'

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

jest.mock('../IntentAI', () => ({
  ...jest.requireActual('../IntentAI'),
  IntentAITabContent: () => <div data-testid='intentAI' />
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn()
}))

describe('NetworkAssurance', () => {
  beforeEach(() => {
    setRaiPermissions({
      READ_INCIDENTS: true,
      READ_INTENT_AI: true
    } as RaiPermissions)
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', { data: mockNetworkHierarchy })
    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text(
        '[{"key": "enabled-intent-features", "value": "[]"}]')))
    )
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
    mockGet.mockReturnValue(true)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INTENTAI}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('intentAI')).toBeVisible()
  })
  it('should not render IntentAI tab when permission not enabled', async () => {
    mockGet.mockReturnValue(true)
    setRaiPermissions({
      READ_INCIDENTS: true,
      READ_INTENT_AI: false
    } as RaiPermissions)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(screen.queryByTestId('intentAI')).not.toBeInTheDocument()
  })
  it('should handle intent tab click in R1', async () => {
    mockGet.mockReturnValue(false)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('IntentAI'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/intentAI', hash: '', search: ''
    }))
  })
  it('should render IntentAI but not config settings button when no permission', async () => {
    mockGet.mockReturnValue(true)
    setRaiPermissions({
      READ_INCIDENTS: true,
      READ_INTENT_AI: true
    } as RaiPermissions)
    jest.mocked(useIsSplitOn).mockImplementation(() => true)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INTENTAI}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('IntentAI')).toBeVisible()
    expect(screen.queryByTestId('intent-subscriptions')).not.toBeInTheDocument()
  })
  it('should render IntentAI and config settings button', async () => {
    mockGet.mockReturnValue(false)
    setRaiPermissions({
      READ_INCIDENTS: true,
      READ_INTENT_AI: true,
      WRITE_INTENT_AI: true
    } as RaiPermissions)
    jest.mocked(useIsSplitOn).mockImplementation(() => true)
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INTENTAI}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('IntentAI')).toBeVisible()
    expect(await screen.findByTestId('intent-subscriptions')).toBeInTheDocument()
  })
})
