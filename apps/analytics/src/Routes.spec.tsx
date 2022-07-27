import { rest } from 'msw'

import { render, screen, mockServer } from '@acx-ui/test-utils'

import AnalyticsRoutes          from './Routes'

test('should redirect analytics to analytics/incidents', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics',
      wrapRoutes: false
    }
  })
  screen.getByText('bar chart')
})
test('should navigate to analytics/incidents', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/incidents',
      wrapRoutes: false
    }
  })
  screen.getByText('bar chart')
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
  mockServer.use(
    rest.get(
      '/t/tenantId/analytics/incidents/:incidentId',
      (req, res, ctx) => {
        const { incidentId } = req.params
        return res(ctx.json({
          id: incidentId
        }))
      }
    )
  )

  const params = {
    incidentId: 'df5339ba-da3b-4110-a291-7f8993a274f3'
  }

  render(<AnalyticsRoutes />, {
    route: {
      params,
      path: '/t/tenantId/analytics/incidents/:incidentId',
      wrapRoutes: false
    }
  })
  screen.getByText('Incident Details')
})
