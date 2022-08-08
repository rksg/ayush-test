import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AnalyticsRoutes from './Routes'

jest.mock('./pages/IncidentDetails', () => () => {
  return <div data-testid='incidentDetails' />
})

test('should redirect analytics to analytics/incidents', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics',
      wrapRoutes: false
    }
  })
  screen.getByText('table')
})
test('should navigate to analytics/incidents', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/incidents',
      wrapRoutes: false
    }
  })
  screen.getByText('table')
})
test('should navigate to analytics/recommendations', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/recommendations',
      wrapRoutes: false
    }
  })
  screen.getByText('Recommendations')
})
test('should navigate to analytics/health', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/health',
      wrapRoutes: false
    }
  })
  screen.getByText('Health')
})
test('should navigate to analytics/configChange', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/configChange',
      wrapRoutes: false
    }
  })
  screen.getByText('Config Change')
})
test('should navigate to analytics/occupancy', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/occupancy',
      wrapRoutes: false
    }
  })
  screen.getByText('Occupancy')
})
test('should navigate to analytics/incidentDetails', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/incidents/incidentId',
      wrapRoutes: false
    }
  })
  await screen.findByTestId('incidentDetails')
})
