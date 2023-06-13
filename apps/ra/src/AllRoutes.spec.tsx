import { Provider }                from '@acx-ui/store'
import { render, screen, cleanup } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  IncidentListPageLegacy: () => <div data-testid='incidents'/>,
  IncidentDetails: () => <div data-testid='incidentDetails'/>
}))

describe('AllRoutes', () => {
  afterEach(() => cleanup())
  it('should render incidents correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/incidents' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('incidents')).toBeVisible()
  })

  it('should render incident details correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/incidents/id' }, wrapper: Provider })
    expect(await screen.findByText('Logo.svg')).toBeVisible()
    expect(await screen.findByTestId('incidentDetails')).toBeVisible()
  })
})