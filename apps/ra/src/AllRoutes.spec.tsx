import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object
    .keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(sets)
})
jest.mock('./pages/Dashboard', () => () => <div data-testid='Dashboard' />)
jest.mock('@reports/Routes', () => () => {
  return <div data-testid='reports' />
}, { virtual: true })

describe('AllRoutes', () => {
  beforeEach(() => {
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
  })

  it('should render incidents correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/incidents' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('AIAnalytics')).toBeVisible()
  })

  it('should render incident details correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/incidents/id' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('IncidentDetails')).toBeVisible()
  })

  it('should render config change correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/configChange' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('NetworkAssurance')).toBeVisible()
  })
  it('should render health page correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/health' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('NetworkAssurance')).toBeVisible()
  })
  it('should render video call qoe correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/videoCallQoe' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoe')).toBeVisible()
  })
  it('should render video call qoe details correctly', async () => {
    render(<AllRoutes />, { route: { path: '/ai/videoCallQoe/id' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoeDetails')).toBeVisible()
  })
  it('should render video call qoe form correctly', async () => {
    render(<AllRoutes />,
      { route: { path: '/ai/videoCallQoe/add' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoeForm')).toBeVisible()
  })
  it('should render crrm correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/crrm' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('AIAnalytics')).toBeVisible()
  })
  it('should render aiOps correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/aiOps' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('AIAnalytics')).toBeVisible()
  })
  it('should render crrm details correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/crrm/test-recommendation-id' },
      wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('CrrmDetails')).toBeVisible()
  })
  it('should render aiOps details correctly', async () => {
    render(<AllRoutes />, {
      route: { path: '/ai/recommendations/aiOps/test-recommendation-id' },
      wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
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
})
