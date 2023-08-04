import { Provider }                from '@acx-ui/store'
import { render, screen, cleanup } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  AIAnalytics: () => <div data-testid='aiAnalytics'/>,
  IncidentDetails: () => <div data-testid='incidentDetails'/>,
  RecommendationDetails: () => <div data-testid='recommendationDetails'></div>,
  NetworkAssurance: () => <div data-testid='NetworkAssurance'/>,
  VideoCallQoe: () => <div data-testid='VideoCallQoe'/>,
  VideoCallQoeDetails: () => <div data-testid='VideoCallQoeDetails'/>,
  VideoCallQoeForm: () => <div data-testid='VideoCallQoeForm'/>
}))
jest.mock('@reports/Routes', () => () => {
  return <div data-testid='reports' />
}, { virtual: true })

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
      route: { path: '/analytics/next/recommendations/crrm/test-recommendation-id' },
      wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('recommendationDetails')).toBeVisible()
  })
  it('should render health page correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/health' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('NetworkAssurance')).toBeVisible()
  })
  it('should render video call qoe correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/videoCallQoe' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoe')).toBeVisible()
  })
  it('should render video call qoe details correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/videoCallQoe/id' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoeDetails')).toBeVisible()
  })
  it('should render video call qoe form correctly', async () => {
    render(<AllRoutes />,
      { route: { path: '/analytics/next/videoCallQoe/add' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoeForm')).toBeVisible()
  })
  it('should render recommendations  correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/analytics/next/recommendations/crrm' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('aiAnalytics')).toBeVisible()
  })
  it('should render recommendations aiOps correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/analytics/next/recommendations/aiOps' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('aiAnalytics')).toBeVisible()
  })
  it('should render reports correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/reports/overview' }
      , wrapper: Provider })
    await screen.findByTestId('reports')
  })
  it('should render datastudio correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/dataStudio' }
      , wrapper: Provider })
    await screen.findByTestId('reports')
  })
})
