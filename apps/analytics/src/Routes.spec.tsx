import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AnalyticsRoutes from './Routes'

jest.mock('@acx-ui/analytics/components', () => ({
  HealthPage: () => <div data-testid='healthPage' />,
  IncidentListPage: () => <div data-testid='incidentsListPage' />,
  NetworkHealthPage: () => <div data-testid='NetworkHealthPage' />
}))

jest.mock('./pages/IncidentDetails', () => () => {
  return <div data-testid='incidentDetails' />
})

test('should redirect analytics to analytics/incidents', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentsListPage')).toBeVisible()
})
test('should redirect service validation to serviceValidation/networkHealth', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('NetworkHealthPage')).toBeVisible()
})
test('should navigate to analytics/incidents', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/incidents',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentsListPage')).toBeVisible()
})
test('should navigate to serviceValidation/networkHealth', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('NetworkHealthPage')).toBeVisible()
})
test('should navigate to analytics/recommendations', () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/recommendations',
      wrapRoutes: false
    }
  })
  expect(screen.getByText('Recommendations')).toBeVisible()
})
test('should navigate to analytics/health', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/health',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('healthPage')).toBeVisible()
})
test('should navigate to analytics/health/tab/overview', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/health/tab/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('healthPage')).toBeVisible()
})
test('should navigate to analytics/configChange', () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/configChange',
      wrapRoutes: false
    }
  })
  expect(screen.getByText('Config Change')).toBeVisible()
})
test('should navigate to analytics/incidentDetails', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/incidents/incidentId',
      wrapRoutes: false
    }
  })
  expect(await screen.findByTestId('incidentDetails')).toBeVisible()
})
test('should navigate to analytics/incidents/tab/overview', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/incidents/tab/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentsListPage')).toBeVisible()
})
test('should navigate to serviceValidation/networkHealth/tab/overview', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth/tab/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('NetworkHealthPage')).toBeVisible()
})
