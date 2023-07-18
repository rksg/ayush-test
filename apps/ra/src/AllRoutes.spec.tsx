import { Provider }                from '@acx-ui/store'
import { render, screen, cleanup } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  AIAnalytics: () => <div data-testid='aiAnalytics'/>,
  IncidentDetails: () => <div data-testid='incidentDetails'/>,
  RecommendationDetails: () => <div data-testid='recommendationDetails'></div>,
  NetworkAssurance: () => <div data-testid='NetworkAssurance'/>
}))

describe('AllRoutes', () => {
  beforeEach(() => {
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
  })
  afterEach(() => cleanup())
  it('should render incidents correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/incidents' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('aiAnalytics')).toBeVisible()
  })

  it('should render incident details correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/incidents/id' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('incidentDetails')).toBeVisible()
  })

  it('should render config change correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/configChange' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('aiAnalytics')).toBeVisible()
  })
  it('should render recommendation details correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/analytics/next/recommendations/test-recommendation-id' },
      wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('recommendationDetails')).toBeVisible()
  })
  it('should render health page correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/health' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('NetworkAssurance')).toBeVisible()
  })
  it('should render recommendations correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/recommendations' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('aiAnalytics')).toBeVisible()
  })
})
