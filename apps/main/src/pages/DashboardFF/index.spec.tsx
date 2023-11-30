import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import DashboardFF from '.'

jest.mock('../Dashboard', () => () => {
  return <div data-testid='Dashboard' />
})
jest.mock('../CustomizedDashboard', () => () => {
  return <div data-testid='CustomizedDashboard' />
})

describe('DashboardFF', () => {
  it('renders Dashboard correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><DashboardFF /></Provider>, {
      route: {
        path: '/tenantId/t/dashboard',
        wrapRoutes: false
      }
    })
    expect(await screen.findByTestId('Dashboard')).toBeVisible()
  })

  it('renders CustomizedDashboard correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><DashboardFF /></Provider>, {
      route: {
        path: '/tenantId/t/dashboard',
        wrapRoutes: false
      }
    })
    expect(await screen.findByTestId('CustomizedDashboard')).toBeVisible()
  })

})

